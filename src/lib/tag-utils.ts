import { TagColor } from './tagService';

/**
 * Get tag color classes from Supabase tagColors or use default
 */
export function getTagColorClasses(
    tagName: string,
    tagColors: Record<string, TagColor>
): string {
    // First check if user has custom color from Supabase
    if (tagColors[tagName]) {
        const colors = tagColors[tagName];
        return `${colors.background_color} ${colors.border_color} ${colors.text_color}`;
    }

    // Fallback to default color scheme
    return getDefaultTagColor(tagName);
}

/**
 * Get default tag color (fallback when no Supabase color exists)
 */
function getDefaultTagColor(tag: string): string {
    const colors = [
        'bg-red-500/10 text-red-400 border-red-500/20',
        'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'bg-green-500/10 text-green-400 border-green-500/20',
        'bg-amber-500/10 text-amber-400 border-amber-500/20',
        'bg-purple-500/10 text-purple-400 border-purple-500/20',
        'bg-pink-500/10 text-pink-400 border-pink-500/20',
        'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        'bg-orange-500/10 text-orange-400 border-orange-500/20',
        'bg-teal-500/10 text-teal-400 border-teal-500/20',
        'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    ];

    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

/**
 * Get card styles (border, shadow, stripe) based on the first tag
 */
export function getCardStyles(
    firstTag: string | undefined,
    tagColors: Record<string, TagColor>
): { borderColor: string; shadowColor: string; stripeColor: string } {
    const defaultStyles = {
        borderColor: 'border-white/10',
        shadowColor: 'shadow-primary/5',
        stripeColor: 'bg-primary/20'
    };

    if (!firstTag) return defaultStyles;

    // Helper to extract color name from class (e.g., 'border-red-500/50' -> 'red-500')
    const extractColor = (className: string) => {
        const match = className.match(/border-([a-z]+-\d+)/);
        return match ? match[1] : null;
    };

    if (tagColors[firstTag]) {
        const colorClass = tagColors[firstTag].border_color;
        const colorName = extractColor(colorClass);

        if (colorName) {
            return {
                borderColor: `border-${colorName}/50`,
                shadowColor: `shadow-${colorName}/20`,
                stripeColor: `bg-${colorName}`
            };
        }
    }

    // Fallback logic if no custom color or regex fails
    // We can try to guess from the default tag colors if needed, but for now return a safe default
    // or try to match the fallback colors from getDefaultTagColor

    // Simple fallback map for common colors if regex fails
    const fallbackMap: Record<string, string> = {
        'A.I': 'purple-500',
        'LIFE': 'blue-500',
        'READ': 'green-500',
        'Research': 'pink-500',
        'WORK': 'orange-500',
    };

    const fallbackColor = fallbackMap[firstTag];
    if (fallbackColor) {
        return {
            borderColor: `border-${fallbackColor}/50`,
            shadowColor: `shadow-${fallbackColor}/20`,
            stripeColor: `bg-${fallbackColor}`
        };
    }

    return defaultStyles;
}
