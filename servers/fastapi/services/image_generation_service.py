import base64
import os
import aiohttp
import uuid
from urllib.parse import urlparse
from openai import AsyncOpenAI
from models.image_prompt import ImagePrompt
from models.sql.image_asset import ImageAsset
from utils.get_env import (
    get_disable_image_generation_env,
    get_openai_compat_image_base_url_env,
    get_openai_compat_image_api_key_env,
    get_openai_compat_image_model_env,
)
from utils.image_provider import is_image_generation_disabled
from utils.asset_directory_utils import absolute_fastapi_asset_url
from utils.image_generation_error import normalize_image_generation_error


def _is_nvidia_url(url: str) -> bool:
    parsed = urlparse((url or "").strip())
    return "nvidia.com" in parsed.netloc


class ImageGenerationService:
    def __init__(self, output_directory: str):
        self.output_directory = output_directory
        self.is_image_generation_disabled = is_image_generation_disabled()
        if self.is_image_generation_disabled:
            print(
                f"[image gen] DISABLED — os.getenv('DISABLE_IMAGE_GENERATION')="
                f"{get_disable_image_generation_env()!r}"
            )

    async def generate_image(self, prompt: ImagePrompt) -> str | ImageAsset:
        if self.is_image_generation_disabled:
            print("Image generation is disabled. Using placeholder image.")
            return absolute_fastapi_asset_url("/static/images/placeholder.jpg")

        image_prompt = prompt.get_image_prompt(with_theme=True)
        print(f"Request - Generating Image for {image_prompt}")

        try:
            base_url = get_openai_compat_image_base_url_env()
            if _is_nvidia_url(base_url):
                image_path = await self._generate_image_nvidia(
                    image_prompt, self.output_directory
                )
            else:
                image_path = await self._generate_image_openai_compatible(
                    image_prompt, self.output_directory
                )
            if image_path:
                if os.path.exists(image_path):
                    return ImageAsset(
                        path=image_path,
                        is_uploaded=False,
                        extras={
                            "prompt": prompt.prompt,
                            "theme_prompt": prompt.theme_prompt,
                        },
                    )
                elif image_path.startswith("/app_data/") or image_path.startswith(
                    "/static/"
                ):
                    return absolute_fastapi_asset_url(image_path)
                return image_path
            raise Exception(f"Image not found at {image_path}")

        except Exception as e:
            print(f"Error generating image: {e}")
            normalized_error = normalize_image_generation_error(e)
            if normalized_error is e:
                raise
            raise normalized_error from e

    async def _generate_image_nvidia(
        self, prompt: str, output_directory: str
    ) -> str:
        invoke_url = get_openai_compat_image_base_url_env()
        api_key = get_openai_compat_image_api_key_env()

        if not invoke_url or not api_key:
            raise ValueError(
                "OPENAI_COMPAT_IMAGE_BASE_URL and OPENAI_COMPAT_IMAGE_API_KEY must be set for NVIDIA."
            )

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
        }

        payload = {
            "prompt": prompt,
            "mode": "base",
            "cfg_scale": 3.5,
            "width": 1024,
            "height": 1024,
            "seed": 0,
            "steps": 25,
        }

        async with aiohttp.ClientSession(
            headers=headers, timeout=aiohttp.ClientTimeout(total=120)
        ) as session:
            async with session.post(invoke_url, json=payload) as response:
                response.raise_for_status()
                body = await response.json()

        artifacts = body.get("artifacts", [])
        if not artifacts:
            raise Exception("NVIDIA API returned no image artifacts")

        b64_data = artifacts[0].get("base64")
        if not b64_data:
            raise Exception("NVIDIA API returned artifact without base64 data")

        image_path = os.path.join(output_directory, f"{uuid.uuid4()}.png")
        with open(image_path, "wb") as f:
            f.write(base64.b64decode(b64_data))
        return image_path

    async def _generate_image_openai_compatible(
        self, prompt: str, output_directory: str
    ) -> str:
        base_url = get_openai_compat_image_base_url_env()
        api_key = get_openai_compat_image_api_key_env()
        model = get_openai_compat_image_model_env()

        if not base_url or not api_key or not model:
            raise ValueError(
                "OPENAI_COMPAT_IMAGE_BASE_URL, OPENAI_COMPAT_IMAGE_API_KEY and OPENAI_COMPAT_IMAGE_MODEL must be set."
            )

        parsed = urlparse(base_url)
        origin = f"{parsed.scheme}://{parsed.netloc}"

        client = AsyncOpenAI(base_url=base_url, api_key=api_key)

        response = await client.images.generate(
            model=model,
            prompt=prompt,
            n=1,
            size="1024x1024",
        )

        item = response.data[0]
        image_path = os.path.join(output_directory, f"{uuid.uuid4()}.png")

        if item.b64_json:
            with open(image_path, "wb") as f:
                f.write(base64.b64decode(item.b64_json))
        elif item.url:
            image_url = item.url
            if image_url.startswith("/"):
                image_url = origin + image_url
            headers = {"Authorization": f"Bearer {api_key}"}
            async with aiohttp.ClientSession(trust_env=True) as session:
                dl_resp = await session.get(
                    image_url,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=120),
                )
                if dl_resp.status != 200:
                    raise Exception(
                        f"Failed to download image from OpenAI-compatible provider: {dl_resp.status}"
                    )
                with open(image_path, "wb") as f:
                    f.write(await dl_resp.read())
        else:
            raise Exception("OpenAI-compatible provider returned no image data")

        return image_path
