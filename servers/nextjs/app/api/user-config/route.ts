import { NextResponse } from "next/server";
import { LLMConfig } from "@/types/llm_config";
import {
  readUserConfigFile,
  updateUserConfigFile,
} from "@/lib/user-config-store";

const canChangeKeys = process.env.CAN_CHANGE_KEYS !== "false";
const AUTH_FIELDS = new Set([
  "AUTH_USERNAME",
  "AUTH_PASSWORD_HASH",
  "AUTH_SECRET_KEY",
]);

function stripAuthFields(config: Record<string, unknown>) {
  const sanitized = { ...config };
  for (const key of AUTH_FIELDS) {
    delete sanitized[key];
  }
  return sanitized;
}

function stripAuthFieldsFromIncoming(config: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(config).filter(([key]) => !AUTH_FIELDS.has(key))
  );
}

function getUserConfigPath() {
  return process.env.USER_CONFIG_PATH;
}

export async function GET() {
  if (!canChangeKeys) {
    return NextResponse.json({
      error: "You are not allowed to access this resource",
      status: 403,
    });
  }
  const userConfigPath = getUserConfigPath();
  if (!userConfigPath) {
    return NextResponse.json({
      error: "User config path not found",
      status: 500,
    });
  }

  try {
    const parsedConfig =
      readUserConfigFile<Record<string, unknown>>(userConfigPath);
    return NextResponse.json(stripAuthFields(parsedConfig));
  } catch {
    return NextResponse.json(
      { error: "Unable to read user config", status: 500 },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!canChangeKeys) {
    return NextResponse.json({
      error: "You are not allowed to access this resource",
    });
  }

  const userConfigPath = getUserConfigPath();
  if (!userConfigPath) {
    return NextResponse.json(
      { error: "User config path not found", status: 500 },
      { status: 500 }
    );
  }

  try {
    const userConfig = stripAuthFieldsFromIncoming(
      (await request.json()) as Record<string, unknown>
    ) as LLMConfig;
    const definedIncomingEntries = Object.entries(userConfig).filter(
      ([, value]) => value !== undefined
    );
    const mergedConfig = updateUserConfigFile<LLMConfig>(
      userConfigPath,
      (existingConfig) => ({
        ...existingConfig,
        ...Object.fromEntries(definedIncomingEntries),
        DISABLE_IMAGE_GENERATION: Object.prototype.hasOwnProperty.call(
          userConfig,
          "DISABLE_IMAGE_GENERATION"
        )
          ? userConfig.DISABLE_IMAGE_GENERATION
          : existingConfig.DISABLE_IMAGE_GENERATION,
        DISABLE_ANONYMOUS_TRACKING: Object.prototype.hasOwnProperty.call(
          userConfig,
          "DISABLE_ANONYMOUS_TRACKING"
        )
          ? userConfig.DISABLE_ANONYMOUS_TRACKING
          : existingConfig.DISABLE_ANONYMOUS_TRACKING,
      })
    );
    return NextResponse.json(
      stripAuthFields(mergedConfig as Record<string, unknown>)
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to save user config", status: 500 },
      { status: 500 }
    );
  }
}
