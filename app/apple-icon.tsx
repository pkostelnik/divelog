import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)',
          borderRadius: '40px',
        }}
      >
        {/* Diver head */}
        <div
          style={{
            position: 'absolute',
            width: '28px',
            height: '28px',
            background: 'white',
            borderRadius: '50%',
            top: '50px',
            left: '76px',
            opacity: 0.95,
          }}
        />
        {/* Diver body */}
        <div
          style={{
            position: 'absolute',
            width: '35px',
            height: '50px',
            background: 'white',
            borderRadius: '8px',
            top: '75px',
            left: '72.5px',
            opacity: 0.95,
            display: 'flex',
          }}
        />
        {/* Diver arm left */}
        <div
          style={{
            position: 'absolute',
            width: '20px',
            height: '6px',
            background: 'white',
            borderRadius: '3px',
            top: '90px',
            left: '58px',
            opacity: 0.95,
            transform: 'rotate(-25deg)',
          }}
        />
        {/* Diver arm right */}
        <div
          style={{
            position: 'absolute',
            width: '20px',
            height: '6px',
            background: 'white',
            borderRadius: '3px',
            top: '90px',
            left: '102px',
            opacity: 0.95,
            transform: 'rotate(25deg)',
          }}
        />
        {/* Diver leg left */}
        <div
          style={{
            position: 'absolute',
            width: '8px',
            height: '25px',
            background: 'white',
            borderRadius: '4px',
            top: '120px',
            left: '78px',
            opacity: 0.95,
          }}
        />
        {/* Diver leg right */}
        <div
          style={{
            position: 'absolute',
            width: '8px',
            height: '25px',
            background: 'white',
            borderRadius: '4px',
            top: '120px',
            left: '94px',
            opacity: 0.95,
          }}
        />
        {/* Air bubble 1 */}
        <div
          style={{
            position: 'absolute',
            width: '12px',
            height: '12px',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '50%',
            top: '40px',
            left: '40px',
          }}
        />
        {/* Air bubble 2 */}
        <div
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            background: 'rgba(255, 255, 255, 0.65)',
            borderRadius: '50%',
            top: '30px',
            left: '130px',
          }}
        />
        {/* Air bubble 3 */}
        <div
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
            top: '100px',
            left: '35px',
          }}
        />
        {/* Air bubble 4 */}
        <div
          style={{
            position: 'absolute',
            width: '11px',
            height: '11px',
            background: 'rgba(255, 255, 255, 0.68)',
            borderRadius: '50%',
            top: '90px',
            left: '138px',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
