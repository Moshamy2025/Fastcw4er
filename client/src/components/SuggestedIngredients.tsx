import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SuggestedIngredientsProps {
  suggestedIngredients: string[];
  onClick: (ingredient: string) => void;
}

export default function SuggestedIngredients({
  suggestedIngredients,
  onClick,
}: SuggestedIngredientsProps) {
  if (!suggestedIngredients.length) return null;

  return (
    <Card className="mb-10 shadow-lg border border-dashed border-primary/30 bg-gradient-to-br from-white to-primary/5">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <span className="text-2xl">💡</span> كمان ممكن تستخدم الحاجات دي
        </h2>
        <p className="text-gray-600 mb-4 bg-white/80 p-2 rounded-md shadow-sm">
          لو عندك أي حاجة من دول ممكن تضيفها وهنطلعلك أكلات تانية حلوة:
        </p>
        
        <div className="flex flex-wrap gap-2">
          {suggestedIngredients.map((ingredient, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => onClick(ingredient)}
              className="bg-white hover:bg-primary hover:text-white px-4 py-2 rounded-full text-gray-800 text-sm transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-md border border-primary/30"
            >
              <span className="ml-1 animate-pulse">✨</span> {ingredient} 
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
