import { DistributorSettings } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { AlignLeft, AlignCenter, AlignRight, Move, ZoomIn } from 'lucide-react';

interface LabelFormatSettingsProps {
  settings: DistributorSettings;
  onUpdate: (updates: Partial<DistributorSettings>) => void;
}

const PRESETS = [
  { label: '50×80 mm', width: 50, height: 80 },
  { label: '40×60 mm', width: 40, height: 60 },
  { label: '50×50 mm', width: 50, height: 50 },
  { label: '60×40 mm', width: 60, height: 40 },
];

export function LabelFormatSettings({ settings, onUpdate }: LabelFormatSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Taille de l'étiquette */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Taille de l'étiquette</Label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant={settings.labelWidth === preset.width && settings.labelHeight === preset.height ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ labelWidth: preset.width, labelHeight: preset.height })}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Largeur (mm)</Label>
            <Input
              type="number"
              min={20}
              max={120}
              value={settings.labelWidth}
              onChange={(e) => onUpdate({ labelWidth: parseInt(e.target.value) || 50 })}
              className="h-10 bg-background/50 border-border/50 font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Hauteur (mm)</Label>
            <Input
              type="number"
              min={20}
              max={150}
              value={settings.labelHeight}
              onChange={(e) => onUpdate({ labelHeight: parseInt(e.target.value) || 80 })}
              className="h-10 bg-background/50 border-border/50 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Tailles de texte */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Tailles de texte</Label>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Titre</Label>
              <span className="text-xs font-mono text-muted-foreground">{settings.fontSizeTitle}px</span>
            </div>
            <Slider
              value={[settings.fontSizeTitle]}
              onValueChange={([v]) => onUpdate({ fontSizeTitle: v })}
              min={8}
              max={24}
              step={1}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Corps</Label>
              <span className="text-xs font-mono text-muted-foreground">{settings.fontSizeBody}px</span>
            </div>
            <Slider
              value={[settings.fontSizeBody]}
              onValueChange={([v]) => onUpdate({ fontSizeBody: v })}
              min={6}
              max={18}
              step={1}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Mentions légales</Label>
              <span className="text-xs font-mono text-muted-foreground">{settings.fontSizeLegal}px</span>
            </div>
            <Slider
              value={[settings.fontSizeLegal]}
              onValueChange={([v]) => onUpdate({ fontSizeLegal: v })}
              min={5}
              max={14}
              step={1}
            />
          </div>
        </div>
      </div>

      {/* Alignement */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Alignement du texte</Label>
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
          {([
            { value: 'left' as const, icon: AlignLeft, label: 'Gauche' },
            { value: 'center' as const, icon: AlignCenter, label: 'Centrer' },
            { value: 'right' as const, icon: AlignRight, label: 'Droite' },
          ]).map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant={settings.textAlign === value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onUpdate({ textAlign: value })}
              className="gap-2"
              title={label}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Échelle et décalage du contenu */}
      <div className="space-y-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <ZoomIn className="h-4 w-4" />
          Échelle du contenu
        </Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Zoom</Label>
            <span className="text-xs font-mono text-muted-foreground">{settings.contentScale ?? 100}%</span>
          </div>
          <Slider
            value={[settings.contentScale ?? 100]}
            onValueChange={([v]) => onUpdate({ contentScale: v })}
            min={50}
            max={150}
            step={1}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Move className="h-4 w-4" />
          Décalage du contenu
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Horizontal (mm)</Label>
              <span className="text-xs font-mono text-muted-foreground">{settings.contentOffsetX ?? 0}</span>
            </div>
            <Slider
              value={[settings.contentOffsetX ?? 0]}
              onValueChange={([v]) => onUpdate({ contentOffsetX: v })}
              min={-20}
              max={20}
              step={0.5}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Vertical (mm)</Label>
              <span className="text-xs font-mono text-muted-foreground">{settings.contentOffsetY ?? 0}</span>
            </div>
            <Slider
              value={[settings.contentOffsetY ?? 0]}
              onValueChange={([v]) => onUpdate({ contentOffsetY: v })}
              min={-20}
              max={20}
              step={0.5}
            />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdate({ contentScale: 100, contentOffsetX: 0, contentOffsetY: 0 })}
          className="text-xs"
        >
          Réinitialiser position
        </Button>
      </div>
    </div>
  );
}
