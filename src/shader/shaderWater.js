export const vertexShader = `
    varying vec2 vUv;
    varying float vWave;

    uniform float time;

    void main() {
        vUv = uv;

        // Position de base
        vec3 pos = position;

        // Vagues douces
        float wave1 = sin(pos.x * 2.0 + time * 0.5) * 0.05;
        float wave2 = cos(pos.z * 2.0 + time * 0.5) * 0.05;
        pos.y += wave1 + wave2;

        vWave = wave1 + wave2;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

export const fragmentShader = `
    varying vec2 vUv;
    varying float vWave;
    uniform float time;

    void main() {
        // Couleurs d'eau claires
        vec3 baseColor = vec3(0.4, 0.7, 1.0);  // Bleu clair
        vec3 highlightColor = vec3(1.0, 1.0, 1.0);  // Blanc lumineux pour les reflets

        // Variation des vagues
        float shine = sin(vUv.x * 10.0 + time * 0.5) * 0.1 +
                      cos(vUv.y * 10.0 + time * 1.0) * 0.1;

        // Reflets légers
        float sparkle = step(0.98, fract(sin(dot(vUv * 10.0, vec2(12.9898, 78.233))) * 43758.5453 + time)) * 0.3;

        // Mélange de couleurs
        vec3 color = mix(baseColor, highlightColor, shine + sparkle + vWave * 0.3);

        gl_FragColor = vec4(color, 1.0);
    }
`;
