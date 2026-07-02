#!/usr/bin/env python3
"""Replace next/image with native <img> tags for performance."""
import re
import os

files = [
    'features/admin/brands-manager.tsx',
    'features/admin/image-upload.tsx',
    'features/admin/products-manager.tsx',
    'features/admin/categories-manager.tsx',
    'features/home/categories-section.tsx',
    'features/home/brands-section.tsx',
    'shared/components/search-modal.tsx',
    'shared/components/cart-drawer.tsx',
]

base = '/home/z/my-project/src'

for f in files:
    path = os.path.join(base, f)
    if not os.path.exists(path):
        print(f'  SKIP {f} (not found)')
        continue
    with open(path, 'r', encoding='utf-8') as fh:
        content = fh.read()

    original = content

    # Remove import Image line
    content = re.sub(r"^import Image from 'next/image'\n", '', content, flags=re.MULTILINE)

    # Pattern 1: <Image src={X} alt={Y} width={N} height={N} className="..." unoptimized />
    content = re.sub(
        r'<Image\s+src=\{([^}]+)\}\s+alt=\{([^}]+)\}\s+width=\{\d+\}\s+height=\{\d+\}\s+className="([^"]+)"\s+unoptimized\s*/>',
        r'<img src={\1} alt={\2} className="\3" loading="lazy" />',
        content,
    )

    # Pattern 2: <Image src={X} alt={Y} width={N} height={N} className="..." />
    content = re.sub(
        r'<Image\s+src=\{([^}]+)\}\s+alt=\{([^}]+)\}\s+width=\{\d+\}\s+height=\{\d+\}\s+className="([^"]+)"\s*/>',
        r'<img src={\1} alt={\2} className="\3" loading="lazy" />',
        content,
    )

    # Pattern 3: <Image src={X} alt={Y} fill className="..." unoptimized />
    content = re.sub(
        r'<Image\s+src=\{([^}]+)\}\s+alt=\{([^}]+)\}\s+fill\s+className="([^"]+)"\s+unoptimized\s*/>',
        r'<img src={\1} alt={\2} className="w-full h-full \3" loading="lazy" />',
        content,
    )

    # Pattern 4: <Image src={X} alt={Y} fill className="..." />
    content = re.sub(
        r'<Image\s+src=\{([^}]+)\}\s+alt=\{([^}]+)\}\s+fill\s+className="([^"]+)"\s*/>',
        r'<img src={\1} alt={\2} className="w-full h-full \3" loading="lazy" />',
        content,
    )

    # Pattern 5 (multiline): <Image src={X} alt={Y} fill ... > with multiple lines
    # For categories-section.tsx (multiline Image)
    content = re.sub(
        r'<Image\s*\n\s*src=\{([^}]+)\}\s*\n\s*alt=\{([^}]+)\}\s*\n\s*fill\s*\n\s*className="([^"]+)"\s*\n\s*sizes="[^"]*"\s*\n\s*unoptimized\s*\n\s*/>',
        r'<img src={\1} alt={\2} className="w-full h-full \3" loading="lazy" />',
        content,
    )

    if content != original:
        with open(path, 'w', encoding='utf-8') as fh:
            fh.write(content)
        print(f'  ✓ {f}')
    else:
        print(f'  ⊙ {f} (no change)')

print('Done!')
