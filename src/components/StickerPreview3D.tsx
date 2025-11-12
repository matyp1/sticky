'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense } from 'react'
import * as THREE from 'three'

interface StickerPreviewProps {
  imageUrl?: string
  cutPath?: string
}

function StickerMesh({ imageUrl, cutPath }: StickerPreviewProps) {
  // Create a plane geometry for the sticker
  const geometry = new THREE.PlaneGeometry(2, 2)
  
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#ffffff"
        side={THREE.DoubleSide}
        transparent={true}
      >
        {imageUrl && (
          <primitive attach="map" object={new THREE.TextureLoader().load(imageUrl)} />
        )}
      </meshStandardMaterial>
    </mesh>
  )
}

export default function StickerPreview3D({ imageUrl, cutPath }: StickerPreviewProps) {
  return (
    <div className="w-full h-full min-h-[400px] bg-gray-100 rounded-lg overflow-hidden">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
        />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        
        <Suspense fallback={null}>
          <StickerMesh imageUrl={imageUrl} cutPath={cutPath} />
        </Suspense>
        
        <gridHelper args={[10, 10, '#cccccc', '#eeeeee']} />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 px-3 py-2 rounded-md text-sm text-gray-700">
        <p>🖱️ Click and drag to rotate</p>
        <p>🔍 Scroll to zoom</p>
      </div>
    </div>
  )
}
