#!/usr/bin/env python3
"""
Script to create sample training data structure
"""

import os
import shutil
from pathlib import Path

def create_sample_data_structure():
    """Create sample data directory structure for training"""
    
    # Define the data structure
    data_structure = {
        'data': {
            'training': {
                'plastic_pollution': [],
                'oil_spill': [],
                'algae_bloom': [],
                'sewage_discharge': [],
                'turbidity': [],
                'clean_water': []
            },
            'satellite_images': [],
            'test': {
                'plastic_pollution': [],
                'oil_spill': [],
                'algae_bloom': [],
                'sewage_discharge': [],
                'turbidity': [],
                'clean_water': []
            }
        },
        'models': [],
        'logs': []
    }
    
    # Create directories
    for category, subdirs in data_structure.items():
        category_path = Path(category)
        category_path.mkdir(exist_ok=True)
        
        if isinstance(subdirs, dict):
            for subdir in subdirs.keys():
                subdir_path = category_path / subdir
                subdir_path.mkdir(exist_ok=True)
                
                # Create README files for each category
                readme_path = subdir_path / 'README.md'
                if not readme_path.exists():
                    with open(readme_path, 'w') as f:
                        f.write(f"# {subdir.replace('_', ' ').title()}\n\n")
                        f.write(f"Place your {subdir} images in this directory.\n\n")
                        f.write("Supported formats: JPG, JPEG, PNG, BMP\n")
                        f.write("Recommended size: 224x224 pixels or larger\n")
    
    # Create main README
    main_readme = Path('data/README.md')
    with open(main_readme, 'w') as f:
        f.write("""# Training Data

This directory contains the training data for the pollution classification model.

## Structure

- `training/` - Training images organized by pollution category
- `test/` - Test images for model evaluation
- `satellite_images/` - Cached satellite imagery

## Categories

- `plastic_pollution` - Images of plastic waste and debris
- `oil_spill` - Images of oil spills and petroleum contamination
- `algae_bloom` - Images of harmful algal blooms
- `sewage_discharge` - Images of sewage and wastewater discharge
- `turbidity` - Images of water turbidity and sediment
- `clean_water` - Images of clean, uncontaminated water

## Image Requirements

- Format: JPG, JPEG, PNG, or BMP
- Size: 224x224 pixels or larger (will be resized automatically)
- Quality: High resolution images work best
- Quantity: At least 100 images per category for good results

## Adding Images

1. Place images in the appropriate category directory
2. Use descriptive filenames
3. Ensure images are properly labeled
4. Run the training script: `python train.py --dataset_path ./data/training`
""")
    
    print("Sample data structure created successfully!")
    print("\nDirectory structure:")
    print("data/")
    print("├── training/")
    print("│   ├── plastic_pollution/")
    print("│   ├── oil_spill/")
    print("│   ├── algae_bloom/")
    print("│   ├── sewage_discharge/")
    print("│   ├── turbidity/")
    print("│   └── clean_water/")
    print("├── test/")
    print("│   ├── plastic_pollution/")
    print("│   ├── oil_spill/")
    print("│   ├── algae_bloom/")
    print("│   ├── sewage_discharge/")
    print("│   ├── turbidity/")
    print("│   └── clean_water/")
    print("└── satellite_images/")
    print("\nmodels/")
    print("logs/")
    print("\nNext steps:")
    print("1. Add your training images to the appropriate category directories")
    print("2. Run: python train.py --dataset_path ./data/training")

if __name__ == '__main__':
    create_sample_data_structure()
