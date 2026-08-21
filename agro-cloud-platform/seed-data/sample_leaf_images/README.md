# Sample Leaf Images & Test Datasets

This directory holds sample leaf imagery and references used for evaluating the AI Engine's Computer Vision disease diagnosis model.

## Available Sample Test References:

1. **`tomato_early_blight.jpg`**
   - **Crop**: Tomato (*Solanum lycopersicum*)
   - **Condition**: Early Blight (*Alternaria solani*)
   - **Visual Features**: Concentric target-like rings, yellow chlorotic margin around necrosis.

2. **`paddy_rice_blast.jpg`**
   - **Crop**: Paddy / Rice (*Oryza sativa*)
   - **Condition**: Rice Blast (*Magnaporthe oryzae*)
   - **Visual Features**: Spindle-shaped lesions with gray center and reddish-brown borders.

3. **`wheat_stripe_rust.jpg`**
   - **Crop**: Wheat (*Triticum aestivum*)
   - **Condition**: Yellow / Stripe Rust (*Puccinia striiformis*)
   - **Visual Features**: Parallel yellow-orange pustule stripes running along leaf blades.

4. **`cotton_bacterial_blight.jpg`**
   - **Crop**: Cotton (*Gossypium hirsutum*)
   - **Condition**: Angular Leaf Spot (*Xanthomonas*)
   - **Visual Features**: Angular dark water-soaked patches delineated by veins.

## Test Image Ingestion
You can test the diagnostic API by sending image payloads via `multipart/form-data` to:
`POST /api/v1/diagnose/image`
