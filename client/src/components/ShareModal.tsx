import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Facebook, 
  Twitter, 
  Send, 
  Copy, 
  Download,
  Check,
  Share2,
  MessageCircle
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: {
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    videoId?: string;
    image?: string;
  };
}

export default function ShareModal({ open, onOpenChange, recipe }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { getLocalizedText, language } = useLanguage();
  
  // النصوص المترجمة
  const texts = {
    shareRecipe: {
      'ar-EG': 'مشاركة الوصفة',
      'ar-SA': 'مشاركة الوصفة',
      'en-US': 'Share Recipe'
    },
    shareAs: {
      'ar-EG': 'مشاركة كـ',
      'ar-SA': 'مشاركة كـ',
      'en-US': 'Share as'
    },
    link: {
      'ar-EG': 'رابط',
      'ar-SA': 'رابط',
      'en-US': 'Link'
    },
    card: {
      'ar-EG': 'بطاقة',
      'ar-SA': 'بطاقة',
      'en-US': 'Card'
    },
    social: {
      'ar-EG': 'اجتماعي',
      'ar-SA': 'اجتماعي',
      'en-US': 'Social'
    },
    shareOn: {
      'ar-EG': 'مشاركة على',
      'ar-SA': 'مشاركة على',
      'en-US': 'Share on'
    },
    copyLink: {
      'ar-EG': 'نسخ الرابط',
      'ar-SA': 'نسخ الرابط',
      'en-US': 'Copy Link'
    },
    copied: {
      'ar-EG': 'تم النسخ!',
      'ar-SA': 'تم النسخ!',
      'en-US': 'Copied!'
    },
    downloadCard: {
      'ar-EG': 'تحميل البطاقة',
      'ar-SA': 'تحميل البطاقة',
      'en-US': 'Download Card'
    },
    downloaded: {
      'ar-EG': 'تم التحميل!',
      'ar-SA': 'تم التحميل!',
      'en-US': 'Downloaded!'
    },
    shareOnFacebook: {
      'ar-EG': 'مشاركة على فيسبوك',
      'ar-SA': 'مشاركة على فيسبوك',
      'en-US': 'Share on Facebook'
    },
    shareOnTwitter: {
      'ar-EG': 'مشاركة على تويتر',
      'ar-SA': 'مشاركة على تويتر',
      'en-US': 'Share on Twitter'
    },
    shareOnEmail: {
      'ar-EG': 'مشاركة عبر البريد الإلكتروني',
      'ar-SA': 'مشاركة عبر البريد الإلكتروني',
      'en-US': 'Share via Email'
    },
    shareOnWhatsApp: {
      'ar-EG': 'مشاركة عبر واتساب',
      'ar-SA': 'مشاركة عبر واتساب',
      'en-US': 'Share on WhatsApp'
    },
    shareOnDevice: {
      'ar-EG': 'مشاركة على الجهاز',
      'ar-SA': 'مشاركة على الجهاز',
      'en-US': 'Share on Device'
    },
    ingredients: {
      'ar-EG': 'المكونات',
      'ar-SA': 'المكونات',
      'en-US': 'Ingredients'
    },
    steps: {
      'ar-EG': 'خطوات التحضير',
      'ar-SA': 'خطوات التحضير',
      'en-US': 'Steps'
    },
    close: {
      'ar-EG': 'إغلاق',
      'ar-SA': 'إغلاق',
      'en-US': 'Close'
    },
    quickRecipe: {
      'ar-EG': 'Quick Recipe',
      'ar-SA': 'Quick Recipe',
      'en-US': 'Quick Recipe'
    }
  };

  // نسخ رابط الوصفة
  const copyRecipeLink = () => {
    const recipeData = encodeURIComponent(JSON.stringify({
      title: recipe.title,
      description: recipe.description,
      // نرسل فقط أول 3 مكونات وأول 2 من التعليمات لإبقاء الرابط قصيرًا
      ingredients: recipe.ingredients.slice(0, 3),
      instructions: recipe.instructions.slice(0, 2),
      videoId: recipe.videoId
    }));
    
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/?recipe=${recipeData}`;
    
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // تحميل بطاقة الوصفة كصورة
  const downloadRecipeCard = async () => {
    if (!cardRef.current) return;
    
    try {
      // محاولة استيراد html2canvas بشكل ديناميكي
      const { default: html2canvas } = await import('html2canvas');
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${recipe.title.substring(0, 30)}_quick_recipe.png`;
      link.href = image;
      link.click();
      
      setDownloadComplete(true);
      setTimeout(() => setDownloadComplete(false), 2000);
    } catch (error) {
      console.error("Error generating recipe card:", error);
    }
  };

  // مشاركة على وسائل التواصل الاجتماعي
  const shareOnSocial = async (platform: string) => {
    const recipeTitle = encodeURIComponent(recipe.title);
    const recipeDesc = encodeURIComponent(recipe.description.substring(0, 100) + '...');
    const shareText = encodeURIComponent(`${recipe.title} - ${recipe.description.substring(0, 100)}...`);
    
    // بناء رابط الوصفة
    const recipeData = encodeURIComponent(JSON.stringify({
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients.slice(0, 3),
      instructions: recipe.instructions.slice(0, 2),
      videoId: recipe.videoId
    }));
    
    const baseUrl = window.location.origin;
    const shareUrl = encodeURIComponent(`${baseUrl}/?recipe=${recipeData}`);
    
    // استخدم Web Share API على الأجهزة المحمولة إذا كانت متاحة
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    if (platform === 'native' && typeof navigator.share === 'function' && isMobile) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipe.description,
          url: `${baseUrl}/?recipe=${recipeData}`
        });
        return;
      } catch (error) {
        console.error("Error using Web Share API:", error);
        // سنستمر في استخدام الطريقة التقليدية إذا فشلت مشاركة الويب
      }
    }
    
    let url = '';
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
        break;
      case 'email':
        url = `mailto:?subject=${recipeTitle}&body=${recipeDesc}%0A%0A${shareUrl}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${shareText}%20${shareUrl}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getLocalizedText('shareRecipe', texts.shareRecipe)}</DialogTitle>
          <DialogDescription>
            {getLocalizedText('shareAs', texts.shareAs)}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">{getLocalizedText('link', texts.link)}</TabsTrigger>
            <TabsTrigger value="card">{getLocalizedText('card', texts.card)}</TabsTrigger>
            <TabsTrigger value="social">{getLocalizedText('social', texts.social)}</TabsTrigger>
          </TabsList>
          
          {/* مشاركة كرابط */}
          <TabsContent value="link" className="flex flex-col gap-4 py-4">
            <p className="text-sm text-gray-500">
              {getLocalizedText('copyLink', texts.copyLink)}
            </p>
            <Button 
              onClick={copyRecipeLink} 
              className="w-full gap-2"
              variant="outline"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  {getLocalizedText('copied', texts.copied)}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  {getLocalizedText('copyLink', texts.copyLink)}
                </>
              )}
            </Button>
          </TabsContent>
          
          {/* مشاركة كبطاقة */}
          <TabsContent value="card" className="py-4">
            {/* بطاقة الوصفة للمشاركة */}
            <div 
              ref={cardRef} 
              className="mb-4 overflow-hidden rounded-lg border border-orange-200 p-4 bg-gradient-to-br from-white to-orange-50"
              style={{ width: '100%', maxWidth: '350px', margin: '0 auto' }}
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-orange-600 mb-2 line-clamp-2">
                  {recipe.title}
                </h3>
                <div className="text-xs font-semibold text-orange-500 bg-orange-100 px-2 py-1 rounded-full">
                  {getLocalizedText('quickRecipe', texts.quickRecipe)}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {recipe.description}
              </p>
              
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">
                  {getLocalizedText('ingredients', texts.ingredients)}:
                </h4>
                <ul className="text-xs text-gray-600 space-y-1 pr-4">
                  {recipe.ingredients.slice(0, 5).map((ingredient, idx) => (
                    <li key={idx} className="list-disc line-clamp-1">{ingredient}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-end mt-2">
                <div className="text-xs text-gray-400">
                  QuickRecipe.com
                </div>
              </div>
            </div>
            
            <Button 
              onClick={downloadRecipeCard} 
              className="w-full gap-2"
              variant="outline"
            >
              {downloadComplete ? (
                <>
                  <Check className="h-4 w-4" />
                  {getLocalizedText('downloaded', texts.downloaded)}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  {getLocalizedText('downloadCard', texts.downloadCard)}
                </>
              )}
            </Button>
          </TabsContent>
          
          {/* مشاركة على وسائل التواصل */}
          <TabsContent value="social" className="py-4">
            <div className="grid grid-cols-2 gap-3">
              {/* إضافة زر المشاركة الأصلي للجهاز (Web Share API) */}
              {'share' in navigator && (
                <Button 
                  variant="outline" 
                  className="w-full gap-2 flex-1"
                  onClick={() => shareOnSocial('native')}
                >
                  <Share2 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{getLocalizedText('shareOnDevice', texts.shareOnDevice)}</span>
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full gap-2 flex-1"
                onClick={() => shareOnSocial('facebook')}
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                <span className="text-sm">{getLocalizedText('shareOnFacebook', texts.shareOnFacebook)}</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full gap-2 flex-1"
                onClick={() => shareOnSocial('twitter')}
              >
                <Twitter className="h-4 w-4 text-blue-400" />
                <span className="text-sm">{getLocalizedText('shareOnTwitter', texts.shareOnTwitter)}</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full gap-2 flex-1"
                onClick={() => shareOnSocial('whatsapp')}
              >
                <MessageCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{getLocalizedText('shareOnWhatsApp', texts.shareOnWhatsApp)}</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full gap-2 flex-1"
                onClick={() => shareOnSocial('email')}
              >
                <Send className="h-4 w-4 text-gray-600" />
                <span className="text-sm">{getLocalizedText('shareOnEmail', texts.shareOnEmail)}</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {getLocalizedText('close', texts.close)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}