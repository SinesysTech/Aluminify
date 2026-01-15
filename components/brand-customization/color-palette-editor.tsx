"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye,
  Save,
  CheckCircle,
  Loader2,
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react';
import type {
  ColorPaletteEditorProps,
  CreateColorPaletteRequest,
  AccessibilityReport
} from '@/types/brand-customization';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  required?: boolean;
  disabled?: boolean;
}

interface ColorPreviewProps {
  colors: CreateColorPaletteRequest;
  className?: string;
}

interface PresetPalette {
  id: string;
  name: string;
  colors: Partial<CreateColorPaletteRequest>;
  category: 'default' | 'brand' | 'custom';
}

// Color input component with live preview
function ColorInput({ label, value, onChange, description, required = false, disabled = false }: ColorInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isValid, setIsValid] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const validateColor = useCallback((color: string): boolean => {
    // Validate hex color format
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }, []);

  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue);
    const valid = validateColor(newValue);
    setIsValid(valid);

    if (valid) {
      onChange(newValue);
    }
  }, [onChange, validateColor]);

  const handleBlur = useCallback(() => {
    if (!isValid && localValue) {
      // Try to fix common issues
      let fixedValue = localValue;
      if (!fixedValue.startsWith('#')) {
        fixedValue = '#' + fixedValue;
      }
      if (validateColor(fixedValue)) {
        setLocalValue(fixedValue);
        setIsValid(true);
        onChange(fixedValue);
      }
    }
  }, [localValue, isValid, onChange, validateColor]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={label} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {value && (
          <Button
            onClick={copyToClipboard}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            id={label}
            type="text"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="#000000"
            disabled={disabled}
            className={`pr-12 ${!isValid ? 'border-destructive' : ''}`}
          />
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-border"
            style={{ backgroundColor: isValid ? localValue : '#transparent' }}
          />
        </div>

        <input
          type="color"
          value={isValid ? localValue : '#000000'}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          className="w-10 h-9 rounded border border-border cursor-pointer disabled:cursor-not-allowed"
        />
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {!isValid && (
        <p className="text-xs text-destructive">Por favor, insira uma cor hexadecimal válida (ex: #FF0000)</p>
      )}
    </div>
  );
}

// Color preview component showing how colors look together
function ColorPreview({ colors, className = "" }: ColorPreviewProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 gap-4">
        {/* Primary color preview */}
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: colors.primaryColor,
            color: colors.primaryForeground,
            borderColor: colors.primaryColor
          }}
        >
          <div className="font-medium">Primária</div>
          <div className="text-sm opacity-90">Conteúdo primário</div>
        </div>

        {/* Secondary color preview */}
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: colors.secondaryColor,
            color: colors.secondaryForeground,
            borderColor: colors.secondaryColor
          }}
        >
          <div className="font-medium">Secundária</div>
          <div className="text-sm opacity-90">Conteúdo secundário</div>
        </div>

        {/* Accent color preview */}
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: colors.accentColor,
            color: colors.accentForeground,
            borderColor: colors.accentColor
          }}
        >
          <div className="font-medium">Destaque</div>
          <div className="text-sm opacity-90">Conteúdo destaque</div>
        </div>

        {/* Muted color preview */}
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: colors.mutedColor,
            color: colors.mutedForeground,
            borderColor: colors.mutedColor
          }}
        >
          <div className="font-medium">Suave</div>
          <div className="text-sm opacity-90">Conteúdo suave</div>
        </div>
      </div>

      {/* Card preview */}
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: colors.cardColor,
          color: colors.cardForeground,
          borderColor: colors.mutedColor
        }}
      >
        <div className="font-medium mb-2">Exemplo de Card</div>
        <div className="text-sm text-muted-foreground mb-3">
          É assim que os cards aparecerão com sua paleta de cores.
        </div>
        <div className="flex gap-2">
          <div
            className="px-3 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: colors.primaryColor,
              color: colors.primaryForeground
            }}
          >
            Botão Primário
          </div>
          <div
            className="px-3 py-1 rounded text-xs font-medium border"
            style={{
              borderColor: colors.primaryColor,
              color: colors.primaryColor
            }}
          >
            Botão Outline
          </div>
        </div>
      </div>

      {/* Sidebar preview */}
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: colors.sidebarBackground,
          color: colors.sidebarForeground,
          borderColor: colors.mutedColor
        }}
      >
        <div className="font-medium mb-2">Visualização da Barra Lateral</div>
        <div
          className="px-2 py-1 rounded text-sm"
          style={{
            backgroundColor: colors.sidebarPrimary,
            color: colors.sidebarPrimaryForeground
          }}
        >
          Item de Menu Ativo
        </div>
      </div>
    </div>
  );
}

export function ColorPaletteEditor({
  currentPalette,
  onSave,
  onPreview,
  onValidate
}: ColorPaletteEditorProps) {
  // State management
  const [paletteData, setPaletteData] = useState<CreateColorPaletteRequest>({
    name: currentPalette?.name || '',
    primaryColor: currentPalette?.primaryColor || '#0f172a',
    primaryForeground: currentPalette?.primaryForeground || '#f8fafc',
    secondaryColor: currentPalette?.secondaryColor || '#f1f5f9',
    secondaryForeground: currentPalette?.secondaryForeground || '#0f172a',
    accentColor: currentPalette?.accentColor || '#3b82f6',
    accentForeground: currentPalette?.accentForeground || '#f8fafc',
    mutedColor: currentPalette?.mutedColor || '#f1f5f9',
    mutedForeground: currentPalette?.mutedForeground || '#64748b',
    backgroundColor: currentPalette?.backgroundColor || '#ffffff',
    foregroundColor: currentPalette?.foregroundColor || '#0f172a',
    cardColor: currentPalette?.cardColor || '#ffffff',
    cardForeground: currentPalette?.cardForeground || '#0f172a',
    destructiveColor: currentPalette?.destructiveColor || '#ef4444',
    destructiveForeground: currentPalette?.destructiveForeground || '#f8fafc',
    sidebarBackground: currentPalette?.sidebarBackground || '#f8fafc',
    sidebarForeground: currentPalette?.sidebarForeground || '#0f172a',
    sidebarPrimary: currentPalette?.sidebarPrimary || '#3b82f6',
    sidebarPrimaryForeground: currentPalette?.sidebarPrimaryForeground || '#f8fafc',
  });

  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [accessibilityReport, setAccessibilityReport] = useState<AccessibilityReport | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('editor');
  const [previewMode, setPreviewMode] = useState(false);

  // Preset palettes for quick selection
  const presetPalettes: PresetPalette[] = useMemo(() => [
    {
      id: 'default-light',
      name: 'Padrão Claro',
      category: 'default',
      colors: {
        primaryColor: '#0f172a',
        primaryForeground: '#f8fafc',
        secondaryColor: '#f1f5f9',
        secondaryForeground: '#0f172a',
        accentColor: '#3b82f6',
        accentForeground: '#f8fafc',
        backgroundColor: '#ffffff',
        foregroundColor: '#0f172a',
      }
    },
    {
      id: 'default-dark',
      name: 'Padrão Escuro',
      category: 'default',
      colors: {
        primaryColor: '#f8fafc',
        primaryForeground: '#0f172a',
        secondaryColor: '#1e293b',
        secondaryForeground: '#f8fafc',
        accentColor: '#3b82f6',
        accentForeground: '#f8fafc',
        backgroundColor: '#0f172a',
        foregroundColor: '#f8fafc',
      }
    },
    {
      id: 'brand-blue',
      name: 'Azul Corporativo',
      category: 'brand',
      colors: {
        primaryColor: '#1e40af',
        primaryForeground: '#ffffff',
        secondaryColor: '#dbeafe',
        secondaryForeground: '#1e40af',
        accentColor: '#3b82f6',
        accentForeground: '#ffffff',
        backgroundColor: '#ffffff',
        foregroundColor: '#1f2937',
      }
    },
    {
      id: 'brand-green',
      name: 'Verde Natureza',
      category: 'brand',
      colors: {
        primaryColor: '#059669',
        primaryForeground: '#ffffff',
        secondaryColor: '#d1fae5',
        secondaryForeground: '#059669',
        accentColor: '#10b981',
        accentForeground: '#ffffff',
        backgroundColor: '#ffffff',
        foregroundColor: '#1f2937',
      }
    },
    {
      id: 'brand-purple',
      name: 'Roxo Criativo',
      category: 'brand',
      colors: {
        primaryColor: '#7c3aed',
        primaryForeground: '#ffffff',
        secondaryColor: '#ede9fe',
        secondaryForeground: '#7c3aed',
        accentColor: '#8b5cf6',
        accentForeground: '#ffffff',
        backgroundColor: '#ffffff',
        foregroundColor: '#1f2937',
      }
    }
  ], []);

  // Initialize palette data when currentPalette changes
  useEffect(() => {
    if (currentPalette) {
      setPaletteData({
        name: currentPalette.name,
        primaryColor: currentPalette.primaryColor,
        primaryForeground: currentPalette.primaryForeground,
        secondaryColor: currentPalette.secondaryColor,
        secondaryForeground: currentPalette.secondaryForeground,
        accentColor: currentPalette.accentColor,
        accentForeground: currentPalette.accentForeground,
        mutedColor: currentPalette.mutedColor,
        mutedForeground: currentPalette.mutedForeground,
        backgroundColor: currentPalette.backgroundColor,
        foregroundColor: currentPalette.foregroundColor,
        cardColor: currentPalette.cardColor,
        cardForeground: currentPalette.cardForeground,
        destructiveColor: currentPalette.destructiveColor,
        destructiveForeground: currentPalette.destructiveForeground,
        sidebarBackground: currentPalette.sidebarBackground,
        sidebarForeground: currentPalette.sidebarForeground,
        sidebarPrimary: currentPalette.sidebarPrimary,
        sidebarPrimaryForeground: currentPalette.sidebarPrimaryForeground,
      });
    }
  }, [currentPalette]);

  // Auto-preview when palette data changes
  useEffect(() => {
    if (previewMode) {
      onPreview(paletteData);
    }
  }, [paletteData, previewMode, onPreview]);

  // Validation function
  const validatePalette = useCallback((): string[] => {
    const errors: string[] = [];

    if (!paletteData.name.trim()) {
      errors.push('Nome da paleta é obrigatório');
    }

    if (paletteData.name.length > 100) {
      errors.push('Nome da paleta deve ter menos de 100 caracteres');
    }

    // Validate all color fields are valid hex colors
    const colorFields = [
      'primaryColor', 'primaryForeground', 'secondaryColor', 'secondaryForeground',
      'accentColor', 'accentForeground', 'mutedColor', 'mutedForeground',
      'backgroundColor', 'foregroundColor', 'cardColor', 'cardForeground',
      'destructiveColor', 'destructiveForeground', 'sidebarBackground',
      'sidebarForeground', 'sidebarPrimary', 'sidebarPrimaryForeground'
    ];

    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    for (const field of colorFields) {
      const value = paletteData[field as keyof CreateColorPaletteRequest] as string;
      if (!hexRegex.test(value)) {
        errors.push(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} deve ser uma cor hexadecimal válida`);
      }
    }

    return errors;
  }, [paletteData]);

  // Handle palette data updates
  const updatePaletteData = useCallback((field: keyof CreateColorPaletteRequest, value: string) => {
    setPaletteData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle preset selection
  const applyPreset = useCallback((preset: PresetPalette) => {
    setPaletteData(prev => ({
      ...prev,
      ...preset.colors,
      name: prev.name || preset.name
    }));
  }, []);

  // Handle accessibility validation
  const handleValidateAccessibility = useCallback(async () => {
    try {
      setIsValidating(true);
      const report = await onValidate(paletteData);
      setAccessibilityReport(report);
    } catch (error) {
      console.error('Accessibility validation failed:', error);
      setAccessibilityReport({
        isCompliant: false,
        contrastRatios: {
          primaryOnBackground: 0,
          secondaryOnBackground: 0,
          accentOnBackground: 0
        },
        warnings: ['Falha ao validar acessibilidade. Por favor, verifique suas cores manualmente.']
      });
    } finally {
      setIsValidating(false);
    }
  }, [paletteData, onValidate]);

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);

      // Validate before saving
      const errors = validatePalette();
      setValidationErrors(errors);

      if (errors.length > 0) {
        return;
      }

      await onSave(paletteData);

    } catch (error) {
      console.error('Failed to save color palette:', error);
      setValidationErrors(['Falha ao salvar paleta de cores. Por favor, tente novamente.']);
    } finally {
      setIsSaving(false);
    }
  }, [paletteData, onSave, validatePalette]);

  // Toggle preview mode
  const togglePreview = useCallback(() => {
    setPreviewMode(prev => {
      const newPreviewMode = !prev;
      if (newPreviewMode) {
        onPreview(paletteData);
      }
      return newPreviewMode;
    });
  }, [paletteData, onPreview]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Editor de Paleta de Cores</h3>
          <p className="text-sm text-muted-foreground">
            Crie e personalize a paleta de cores da sua marca
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={togglePreview}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'Sair da Visualização' : 'Visualizar'}
          </Button>

          <Button
            onClick={handleValidateAccessibility}
            variant="outline"
            size="sm"
            disabled={isValidating}
            className="gap-2"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Validar Acessibilidade
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">Por favor, corrija os seguintes erros:</div>
              {validationErrors.map((error, index) => (
                <div key={index} className="text-sm">• {error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Accessibility Report */}
      {accessibilityReport && (
        <Alert variant={accessibilityReport.isCompliant ? "default" : "destructive"}>
          {accessibilityReport.isCompliant ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">
                Relatório de Acessibilidade: {accessibilityReport.isCompliant ? 'Em conformidade' : 'Problemas encontrados'}
              </div>

              <div className="text-sm space-y-1">
                <div>Primária no Fundo: {accessibilityReport.contrastRatios.primaryOnBackground.toFixed(2)}:1</div>
                <div>Secundária no Fundo: {accessibilityReport.contrastRatios.secondaryOnBackground.toFixed(2)}:1</div>
                <div>Destaque no Fundo: {accessibilityReport.contrastRatios.accentOnBackground.toFixed(2)}:1</div>
              </div>

              {accessibilityReport.recommendations && accessibilityReport.recommendations.length > 0 && (
                <div className="text-sm">
                  <div className="font-medium">Recomendações:</div>
                  {accessibilityReport.recommendations.map((rec, index) => (
                    <div key={index}>• {rec}</div>
                  ))}
                </div>
              )}

              {accessibilityReport.warnings && accessibilityReport.warnings.length > 0 && (
                <div className="text-sm">
                  <div className="font-medium">Avisos:</div>
                  {accessibilityReport.warnings.map((warning, index) => (
                    <div key={index}>• {warning}</div>
                  ))}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="presets">Predefinições</TabsTrigger>
          <TabsTrigger value="preview">Visualizar</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6 mt-6">
          {/* Palette Name */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Paleta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="palette-name">Nome da Paleta *</Label>
                  <Input
                    id="palette-name"
                    value={paletteData.name}
                    onChange={(e) => updatePaletteData('name', e.target.value)}
                    placeholder="Digite o nome da paleta"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Primary Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Cores Primárias</CardTitle>
              <CardDescription>
                Principais cores da marca usadas para ações primárias e ênfase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorInput
                  label="Cor Primária"
                  value={paletteData.primaryColor}
                  onChange={(value) => updatePaletteData('primaryColor', value)}
                  description="Cor principal da marca"
                  required
                />
                <ColorInput
                  label="Texto Primário"
                  value={paletteData.primaryForeground}
                  onChange={(value) => updatePaletteData('primaryForeground', value)}
                  description="Cor do texto no fundo primário"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Secondary Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Cores Secundárias</CardTitle>
              <CardDescription>
                Cores de suporte para ações secundárias e conteúdo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorInput
                  label="Cor Secundária"
                  value={paletteData.secondaryColor}
                  onChange={(value) => updatePaletteData('secondaryColor', value)}
                  description="Cor secundária da marca"
                  required
                />
                <ColorInput
                  label="Texto Secundário"
                  value={paletteData.secondaryForeground}
                  onChange={(value) => updatePaletteData('secondaryForeground', value)}
                  description="Cor do texto no fundo secundário"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Accent Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Cores de Destaque</CardTitle>
              <CardDescription>
                Cores de destaque para realces e elementos especiais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorInput
                  label="Cor de Destaque"
                  value={paletteData.accentColor}
                  onChange={(value) => updatePaletteData('accentColor', value)}
                  description="Cor de destaque/realce"
                  required
                />
                <ColorInput
                  label="Texto de Destaque"
                  value={paletteData.accentForeground}
                  onChange={(value) => updatePaletteData('accentForeground', value)}
                  description="Cor do texto no fundo de destaque"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Background Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Cores de Fundo</CardTitle>
              <CardDescription>
                Cores base para fundos e superfícies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorInput
                  label="Cor de Fundo"
                  value={paletteData.backgroundColor}
                  onChange={(value) => updatePaletteData('backgroundColor', value)}
                  description="Cor de fundo principal"
                  required
                />
                <ColorInput
                  label="Cor do Texto"
                  value={paletteData.foregroundColor}
                  onChange={(value) => updatePaletteData('foregroundColor', value)}
                  description="Cor do texto principal"
                  required
                />
                <ColorInput
                  label="Cor do Card"
                  value={paletteData.cardColor}
                  onChange={(value) => updatePaletteData('cardColor', value)}
                  description="Cor de fundo dos cards"
                  required
                />
                <ColorInput
                  label="Texto do Card"
                  value={paletteData.cardForeground}
                  onChange={(value) => updatePaletteData('cardForeground', value)}
                  description="Cor do texto nos cards"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Muted Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Cores Suaves</CardTitle>
              <CardDescription>
                Cores sutis para elementos menos proeminentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorInput
                  label="Cor Suave"
                  value={paletteData.mutedColor}
                  onChange={(value) => updatePaletteData('mutedColor', value)}
                  description="Cor de fundo suave"
                  required
                />
                <ColorInput
                  label="Texto Suave"
                  value={paletteData.mutedForeground}
                  onChange={(value) => updatePaletteData('mutedForeground', value)}
                  description="Cor do texto suave"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* System Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Cores do Sistema</CardTitle>
              <CardDescription>
                Cores para estados do sistema e feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorInput
                  label="Cor de Erro/Perigo"
                  value={paletteData.destructiveColor}
                  onChange={(value) => updatePaletteData('destructiveColor', value)}
                  description="Cor para erros e ações destrutivas"
                  required
                />
                <ColorInput
                  label="Texto de Erro/Perigo"
                  value={paletteData.destructiveForeground}
                  onChange={(value) => updatePaletteData('destructiveForeground', value)}
                  description="Cor do texto no fundo de erro"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Cores da Barra Lateral</CardTitle>
              <CardDescription>
                Cores específicas para a navegação lateral
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorInput
                  label="Fundo da Barra Lateral"
                  value={paletteData.sidebarBackground}
                  onChange={(value) => updatePaletteData('sidebarBackground', value)}
                  description="Cor de fundo da barra lateral"
                  required
                />
                <ColorInput
                  label="Texto da Barra Lateral"
                  value={paletteData.sidebarForeground}
                  onChange={(value) => updatePaletteData('sidebarForeground', value)}
                  description="Cor do texto da barra lateral"
                  required
                />
                <ColorInput
                  label="Cor Primária da Barra Lateral"
                  value={paletteData.sidebarPrimary}
                  onChange={(value) => updatePaletteData('sidebarPrimary', value)}
                  description="Cor do item ativo na barra lateral"
                  required
                />
                <ColorInput
                  label="Texto Primário da Barra Lateral"
                  value={paletteData.sidebarPrimaryForeground}
                  onChange={(value) => updatePaletteData('sidebarPrimaryForeground', value)}
                  description="Cor do texto ativo na barra lateral"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presets" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Predefinições de Paletas</CardTitle>
              <CardDescription>
                Escolha entre paletas predefinidas ou use-as como ponto de partida
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Default Presets */}
                <div>
                  <h4 className="font-medium mb-3">Padrão</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {presetPalettes.filter(p => p.category === 'default').map((preset) => (
                      <Card key={preset.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium">{preset.name}</h5>
                            <Button
                              onClick={() => applyPreset(preset)}
                              size="sm"
                              variant="outline"
                            >
                              Aplicar
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            {Object.entries(preset.colors).slice(0, 6).map(([key, color]) => (
                              <div
                                key={key}
                                className="w-6 h-6 rounded border border-border"
                                style={{ backgroundColor: color }}
                                title={`${key}: ${color}`}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Brand Presets */}
                <div>
                  <h4 className="font-medium mb-3">Marcas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {presetPalettes.filter(p => p.category === 'brand').map((preset) => (
                      <Card key={preset.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium">{preset.name}</h5>
                            <Button
                              onClick={() => applyPreset(preset)}
                              size="sm"
                              variant="outline"
                            >
                              Aplicar
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            {Object.entries(preset.colors).slice(0, 6).map(([key, color]) => (
                              <div
                                key={key}
                                className="w-6 h-6 rounded border border-border"
                                style={{ backgroundColor: color }}
                                title={`${key}: ${color}`}
                              />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Visualização da Paleta de Cores</CardTitle>
              <CardDescription>
                Veja como sua paleta de cores ficará na interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ColorPreview colors={paletteData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving || validationErrors.length > 0}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar Paleta de Cores
        </Button>
      </div>
    </div>
  );
}