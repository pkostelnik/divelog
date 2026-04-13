import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32
};

export const contentType = "image/png";

export default async function Icon() {
  const imageBuffer = await readFile(
    path.join(process.cwd(), "public/assets/divelog-logo.png")
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
