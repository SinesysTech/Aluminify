"use client";

import { Palette, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  PresetSelector,
  SidebarModeSelector,
  ThemeScaleSelector,
  ColorModeSelector,
  ContentLayoutSelector,
  ThemeRadiusSelector,
  ResetThemeButton
} from "@/components/theme-customizer/index";
import { BrandCustomizationPanel } from "@/components/brand-customization";
import { useIsMobile } from "@/hooks/use-mobile";
import { useThemeConfig } from "@/components/active-theme";
import { useState } from "react";
import type { SaveTenantBrandingRequest } from "@/types/brand-customization";

export function ThemeCustomizerPanel() {
  const isMobile = useIsMobile();
  const { theme } = useThemeConfig();
  const [showBrandCustomization, setShowBrandCustomization] = useState(false);

  // Check if user has access to brand customization (empresa admin)
  const hasBrandCustomizationAccess = true; // TODO: Implement proper access control
  
  // Mock empresa ID - in real implementation, this would come from user context
  const empresaId = "mock-empresa-id"; // TODO: Get from user context

  // Mock handlers for brand customization - these would integrate with actual API
  const handleSaveBranding = async (branding: SaveTenantBrandingRequest) => {
    console.log('Saving brand customization:', branding);
    // TODO: Implement actual API call
    // await fetch(`/api/tenant-branding/${empresaId}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(branding)
    // });
  };

  const handleResetBranding = async () => {
    console.log('Resetting brand customization');
    // TODO: Implement actual API call
    // await fetch(`/api/tenant-branding/${empresaId}`, {
    //   method: 'DELETE'
    // });
  };

  const handleCancelBranding = () => {
    console.log('Cancelling brand customization');
    setShowBrandCustomization(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="ghost">
          <Palette />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="me-4 w-72 p-4 shadow-xl lg:me-0"
        align={isMobile ? "center" : "end"}>
        <div className="grid space-y-4">
          {/* Standard theme customization options */}
          <PresetSelector />
          <ThemeScaleSelector />
          <ThemeRadiusSelector />
          <ColorModeSelector />
          <ContentLayoutSelector />
          <SidebarModeSelector />
          
          {/* Brand customization section for empresa admins */}
          {hasBrandCustomizationAccess && (
            <>
              <DropdownMenuSeparator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Brand Customization</span>
                  <BrandCustomizationPanel
                    empresaId={empresaId}
                    currentBranding={theme.activeBranding}
                    onSave={handleSaveBranding}
                    onReset={handleResetBranding}
                    onCancel={handleCancelBranding}
                  />
                </div>
                
                {/* Show active branding info if available */}
                {theme.activeBranding && (
                  <div className="text-xs text-muted-foreground">
                    <div>Custom branding active</div>
                    {theme.activeBranding.colorPalette && (
                      <div>• Custom colors applied</div>
                    )}
                    {theme.activeBranding.fontScheme && (
                      <div>• Custom fonts applied</div>
                    )}
                    {theme.activeBranding.logos.login && (
                      <div>• Custom logo applied</div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <ResetThemeButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
