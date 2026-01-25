import shutil
from pathlib import Path

root = Path(r"E:\Development\aluminify")

# Define paths
backend_services = root / "backend" / "services" / "brand-customization"
shared_brand_components = root / "app" / "shared" / "components" / "brand-customization"
shared_theme_customizer = root / "app" / "shared" / "components" / "theme-customizer"
branding_settings = root / "app" / "[tenant]" / "(dashboard)" / "configuracoes" / "components" / "perfil" / "branding-settings.tsx"
branding_page = root / "app" / "[tenant]" / "(dashboard)" / "admin" / "empresa" / "branding"

# Destination
brand_module = root / "app" / "[tenant]" / "(dashboard)" / "brand-customization"
brand_services = brand_module / "services"
brand_components = brand_module / "components"

# Create structure
brand_services.mkdir(parents=True, exist_ok=True)
brand_components.mkdir(parents=True, exist_ok=True)

print("Step 1: Moving backend services...")
if backend_services.exists():
    for item in backend_services.iterdir():
        if item.is_file():
            shutil.copy2(item, brand_services / item.name)
            print(f"  ✓ {item.name}")

print("\nStep 2: Moving brand customization components...")
if shared_brand_components.exists():
    for item in shared_brand_components.iterdir():
        if item.is_file():
            shutil.copy2(item, brand_components / item.name)
            print(f"  ✓ {item.name}")

print("\nStep 3: Moving branding settings component...")
if branding_settings.exists():
    shutil.copy2(branding_settings, brand_components / "branding-settings.tsx")
    print(f"  ✓ branding-settings.tsx")

print("\nStep 4: Moving branding page...")
if branding_page.exists() and branding_page.is_dir():
    brand_page_tsx = branding_page / "page.tsx"
    if brand_page_tsx.exists():
        shutil.copy2(brand_page_tsx, brand_module / "page.tsx")
        print(f"  ✓ page.tsx")

print("\nStep 5: Removing duplicate theme-customizer...")
if shared_theme_customizer.exists():
    shutil.rmtree(shared_theme_customizer)
    print(f"  ✓ Removed app/shared/components/theme-customizer/")

print("\n✅ Brand customization module structure created!")
