import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { useLocation } from 'react-router-dom';
import { useSpring } from '@react-spring/three';
import { animated } from '@react-spring/three';

function AnimatedSphere({ 
  onClickChange, 
  position = [0, 0, 0],
  opacity = 1 
}: { 
  onClickChange: (clicked: boolean) => void;
  position?: [number, number, number];
  opacity?: number;
}) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const { mouse } = useThree();
  const targetRotation = useRef({ x: 0, y: 0 });
  const lastMousePosition = useRef({ x: 0, y: 0 });

  // 自定義著色器
  const customShader = {
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color('#7c3aed') },
      color2: { value: new THREE.Color('#3b82f6') },
      mousePosition: { value: new THREE.Vector2(0, 0) },
      hover: { value: 0 },
      click: { value: 0 },
      distortion: { value: 0 },
      opacity: { value: opacity },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      uniform float time;
      uniform float hover;
      uniform float click;
      uniform float distortion;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        // 添加波浪效果
        vec3 pos = position;
        float wave = sin(pos.x * 2.0 + time) * cos(pos.y * 2.0 + time) * 0.1;
        
        // 點擊時的爆發效果
        float explosion = click * sin(length(pos) * 10.0 - time * 5.0) * 0.1;
        
        // 扭曲效果
        float twist = distortion * sin(pos.y * 2.0 + time);
        mat3 rotationMatrix = mat3(
          cos(twist), 0.0, sin(twist),
          0.0, 1.0, 0.0,
          -sin(twist), 0.0, cos(twist)
        );
        pos = rotationMatrix * pos;
        
        pos += normal * (wave + hover * 0.1 + explosion);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec2 mousePosition;
      uniform float hover;
      uniform float click;
      uniform float opacity;
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        // 基礎動態紋理
        float noise = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time) * 0.5 + 0.5;
        
        // 滑鼠互動效果
        float mouseDist = length(mousePosition - vUv);
        float mouseInfluence = 1.0 - smoothstep(0.0, 0.5, mouseDist);
        
        // 點擊波紋效果
        float clickWave = click * (1.0 - smoothstep(0.0, 0.5, 
          length(mousePosition - vUv) - mod(time * 2.0, 3.0)));
        
        // 混合顏色
        vec3 color = mix(color1, color2, noise + mouseInfluence * 0.3 + hover * 0.2 + clickWave);
        float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        
        // 添加發光效果
        float glow = (sin(time) * 0.5 + 0.5) * 0.2 + hover * 0.1 + click * 0.2;
        vec3 finalColor = mix(color, vec3(1.0), fresnel * 0.5 + glow);
        
        gl_FragColor = vec4(finalColor, opacity * 0.9);
      }
    `,
  };

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (sphereRef.current) {
      // 平滑追蹤目標旋轉
      sphereRef.current.rotation.x += (targetRotation.current.x - sphereRef.current.rotation.x) * 0.1;
      sphereRef.current.rotation.y += (targetRotation.current.y - sphereRef.current.rotation.y) * 0.1;
      
      // 呼吸效果
      const scale = 2 + Math.sin(t) * 0.05;
      sphereRef.current.scale.setScalar(scale);
    }
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = t;
      materialRef.current.uniforms.mousePosition.value.set(mouse.x * 0.5 + 0.5, mouse.y * 0.5 + 0.5);
      materialRef.current.uniforms.hover.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.hover.value,
        hovered ? 1 : 0,
        0.1
      );
      materialRef.current.uniforms.click.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.click.value,
        clicked ? 1 : 0,
        0.1
      );
      materialRef.current.uniforms.distortion.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.distortion.value,
        clicked ? 1 : 0,
        0.05
      );
    }
  });

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.opacity.value = opacity;
    }
  }, [opacity]);

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (clicked) {
      const deltaX = e.pointer.x - lastMousePosition.current.x;
      const deltaY = e.pointer.y - lastMousePosition.current.y;
      targetRotation.current.x -= deltaY * 0.01;
      targetRotation.current.y += deltaX * 0.01;
    }
    lastMousePosition.current = { x: e.pointer.x, y: e.pointer.y };
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setClicked(true);
    onClickChange(true);
    lastMousePosition.current = { x: e.pointer.x, y: e.pointer.y };
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setClicked(false);
    onClickChange(false);
  };

  const handlePointerLeave = () => {
    setHovered(false);
    setClicked(false);
    onClickChange(false);
  };

  return (
    <Sphere 
      ref={sphereRef} 
      args={[1, 64, 64]} 
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      <shaderMaterial
        ref={materialRef}
        args={[customShader]}
        transparent
        side={THREE.DoubleSide}
      />
    </Sphere>
  );
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const rotationGroup = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (rotationGroup.current) {
      rotationGroup.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  const particleCount = 2000;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const radius = 5 + Math.random() * 5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  return (
    <group ref={rotationGroup}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#8b5cf6"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

// 新增 RotatingStars 組件
function RotatingStars() {
  const starsRotationGroup = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (starsRotationGroup.current) {
      starsRotationGroup.current.rotation.y = clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <group ref={starsRotationGroup}>
      <Stars
        radius={50}
        depth={50}
        count={7000}
        factor={4}
        saturation={0.5}
        fade
        speed={1.5}
      />
    </group>
  );
}

export default function Background3D() {
  const [isClicked, setIsClicked] = useState(false);
  const location = useLocation();
  const isVaultPage = location.pathname === '/vault';
  const isAboutPage = location.pathname === '/about';

  // 左球體的動畫配置
  const leftSphereSpring = useSpring({
    to: {
      position: isVaultPage ? [0, 0, 0] as const : [-13, 0, 0] as const,
      scale: isVaultPage ? 1 : 2,
    },
    config: {
      mass: 2,
      tension: 60,    // 降低張力
      friction: 30    // 增加摩擦力
    }
  });

  // 右球體的動畫配置
  const rightSphereSpring = useSpring({
    to: {
      position: isVaultPage ? [0, 0, 0] as const : [13, 0, 0] as const,
      scale: isVaultPage ? 1 : 2,
    },
    config: {
      mass: 2,
      tension: 60,
      friction: 30
    }
  });

  // 左球體的透明度配置
  const { number: leftOpacityValue } = useSpring({
    from: { number: 1 },
    to: { 
      number: isAboutPage ? 0.8 : 1 
    },
    config: {
      mass: 2,
      tension: 40,     // 進一步降低張力
      friction: 35,    // 進一步增加摩擦力
      clamp: false
    }
  });

  // 右球體的透明度配置
  const { number: rightOpacityValue } = useSpring({
    from: { number: 1 },
    to: { 
      number: isVaultPage ? 1 : isAboutPage ? 0.8 : 1 
    },
    config: {
      mass: 2,
      tension: 40,
      friction: 35,
      clamp: false,
      precision: 0.001
    }
  });

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{
          position: [0, 0, 18],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
      >
        <color attach="background" args={['#000']} />
        <fog attach="fog" args={['#000', 20, 90]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        <animated.mesh position={leftSphereSpring.position} scale={leftSphereSpring.scale}>
          <AnimatedSphere 
            onClickChange={setIsClicked} 
            position={[0, 0, 0]}
            opacity={leftOpacityValue.get()}
          />
        </animated.mesh>

        <animated.mesh 
          position={rightSphereSpring.position} 
          scale={rightSphereSpring.scale}
        >
          <AnimatedSphere 
            onClickChange={setIsClicked} 
            position={[0, 0, 0]}
            opacity={rightOpacityValue.get()}
          />
        </animated.mesh>
        
        <ParticleField />
        <RotatingStars />

        <OrbitControls
          enableZoom={false}
          autoRotate={false}
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
          enabled={!isClicked}
        />
      </Canvas>
    </div>
  );
} 