import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180
};

export const contentType = "image/png";

export default async function AppleIcon() {
  const imageBuffer = await readFile(
    path.join(process.cwd(), "public/assets/Copilot_20260410_212123.png")
  );
  const dataUrl = `data:image/png;base64,${imageBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <img
        src={dataUrl}
        alt="DiveLog Studio icon"
        width="100%"
        height="100%"
        style={{ objectFit: "cover" }}
      />
    ),
    size
  );
}
