import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { Menu, X, HomeIcon, Users, Award, User, Filter, Flame, Clock, Heart, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

// تعريف الحدث المخصص للتعامل مع تغيير التبويب
interface CommunityTabChangeEvent extends CustomEvent {
  detail: { tab: string };
}

export function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCommunityPage, setIsCommunityPage] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // موقع الزر (افتراضيًا في الزاوية اليمنى العليا)
  const [menuPosition, setMenuPosition] = useState({ top: 20, right: 4 });
  const [filterPosition, setFilterPosition] = useState({ top: 20, right: 16 });
  
  // مراجع للأزرار للتعامل مع السحب
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  
  // للتتبع أثناء السحب
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  
  const [location] = useLocation();
  const { language } = useLanguage();
  const isArabic = language.startsWith('ar');
  
  // التحقق مما إذا كانت الصفحة الحالية هي صفحة المجتمع
  useEffect(() => {
    setIsCommunityPage(location === '/community-posts');
    setIsOpen(false);
    setIsFilterOpen(false);
  }, [location]);
  
  // منطق السحب والإفلات للزر الرئيسي
  const handleTouchStart = (e: React.TouchEvent, type: 'menu' | 'filter') => {
    e.preventDefault();
    isDraggingRef.current = true;
    
    const touch = e.touches[0];
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
    
    // تجنب فتح القائمة عند بدء السحب
    e.stopPropagation();
  };
  
  const handleTouchMove = (e: React.TouchEvent, type: 'menu' | 'filter') => {
    if (!isDraggingRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPosRef.current.x;
    const deltaY = touch.clientY - startPosRef.current.y;
    
    // تحديث موقع الزر حسب النوع
    if (type === 'menu') {
      setMenuPosition(prev => ({
        top: Math.max(0, prev.top + deltaY / 4), // تقسيم على 4 يجعل الحركة أكثر سلاسة
        right: Math.max(0, prev.right - deltaX / 4) // لاحظ أن الحركة للأسفل تزيد القيمة
      }));
    } else {
      setFilterPosition(prev => ({
        top: Math.max(0, prev.top + deltaY / 4),
        right: Math.max(0, prev.right - deltaX / 4)
      }));
    }
    
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
  };
  
  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };
  
  const texts = {
    home: isArabic ? "الرئيسية" : "Home",
    community: isArabic ? "المجتمع" : "Community",
    gamification: isArabic ? "التحديات" : "Challenges",
    profile: isArabic ? "الملف الشخصي" : "Profile",
    trending: isArabic ? "الرائج" : "Trending",
    recent: isArabic ? "الأحدث" : "Recent",
    following: isArabic ? "المتابَعون" : "Following", 
    challenges: isArabic ? "التحديات" : "Challenges",
  };
  
  // وظيفة لتغيير التبويب في صفحة المجتمع
  const handleCommunityTabChange = (tab: string) => {
    // إنشاء حدث مخصص ليتم الاستماع إليه في صفحة community-posts
    const event = new CustomEvent('communityTabChange', {
      detail: { tab }
    }) as CommunityTabChangeEvent;
    
    // إرسال الحدث للمستمعين
    document.dispatchEvent(event);
    
    // إغلاق القائمة المنسدلة
    setIsFilterOpen(false);
  };
  
  return (
    <>
      {/* زر القائمة الرئيسي */}
      <button 
        ref={menuButtonRef}
        style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
        className="block md:hidden fixed z-50 rounded-full p-2 transition-all duration-300 shadow-md bg-gradient-to-r from-orange-500 to-amber-500 text-white cursor-move touch-none active:scale-110"
        onClick={(e) => {
          // فقط إذا لم يكن في وضع السحب
          if (!isDraggingRef.current) {
            setIsOpen(!isOpen);
            setIsFilterOpen(false);
          }
        }}
        onTouchStart={(e) => handleTouchStart(e, 'menu')}
        onTouchMove={(e) => handleTouchMove(e, 'menu')}
        onTouchEnd={handleTouchEnd}
        aria-label={isArabic ? "قائمة التنقل" : "Navigation menu"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>
      
      {/* زر التصفية لصفحة المجتمع فقط */}
      {isCommunityPage && (
        <button 
          ref={filterButtonRef}
          style={{ top: `${filterPosition.top}px`, right: `${filterPosition.right}px` }}
          className="block md:hidden fixed z-50 rounded-full p-2 transition-all duration-300 shadow-md bg-gradient-to-r from-amber-400 to-yellow-500 text-white cursor-move touch-none active:scale-110"
          onClick={(e) => {
            // فقط إذا لم يكن في وضع السحب
            if (!isDraggingRef.current) {
              setIsFilterOpen(!isFilterOpen);
              setIsOpen(false);
            }
          }}
          onTouchStart={(e) => handleTouchStart(e, 'filter')}
          onTouchMove={(e) => handleTouchMove(e, 'filter')}
          onTouchEnd={handleTouchEnd}
          aria-label={isArabic ? "خيارات التصفية" : "Filter options"}
        >
          {isFilterOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Filter className="h-6 w-6" />
          )}
        </button>
      )}
      
      {/* القائمة المنسدلة الرئيسية */}
      {isOpen && (
        <div 
          style={{ 
            top: `${menuPosition.top + 40}px`, 
            right: `${menuPosition.right}px` 
          }} 
          className="fixed z-40 md:hidden overflow-hidden rounded-lg shadow-lg"
        >
          <div className="bg-gradient-to-b from-orange-50 to-white py-3 px-2 border border-orange-100">
            <nav className="grid gap-2">
              <Link href="/">
                <a className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${location === '/' ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-100'}`}>
                  <HomeIcon className="h-4 w-4" />
                  <span>{texts.home}</span>
                </a>
              </Link>
              <Link href="/community-posts">
                <a className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${location === '/community-posts' ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-100'}`}>
                  <Users className="h-4 w-4" />
                  <span>{texts.community}</span>
                </a>
              </Link>
              <Link href="/gamification-page">
                <a className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${location === '/gamification-page' ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-100'}`}>
                  <Award className="h-4 w-4" />
                  <span>{texts.gamification}</span>
                </a>
              </Link>
              <Link href="/profile-page">
                <a className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${location === '/profile-page' ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-100'}`}>
                  <User className="h-4 w-4" />
                  <span>{texts.profile}</span>
                </a>
              </Link>
            </nav>
          </div>
        </div>
      )}
      
      {/* قائمة التصفية لصفحة المجتمع فقط */}
      {isFilterOpen && isCommunityPage && (
        <div 
          style={{ 
            top: `${filterPosition.top + 40}px`, 
            right: `${filterPosition.right}px` 
          }} 
          className="fixed z-40 md:hidden overflow-hidden rounded-lg shadow-lg"
        >
          <div className="bg-gradient-to-b from-amber-50 to-white py-3 px-2 border border-amber-100">
            <div className="grid gap-1">
              <Button 
                variant="ghost"
                size="sm"
                className="text-sm w-full justify-start hover:bg-amber-100"
                onClick={() => handleCommunityTabChange('trending')}
              >
                <Flame className="h-4 w-4 mr-2 text-amber-500" />
                {texts.trending}
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                className="text-sm w-full justify-start hover:bg-amber-100"
                onClick={() => handleCommunityTabChange('recent')}
              >
                <Clock className="h-4 w-4 mr-2 text-amber-500" />
                {texts.recent}
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                className="text-sm w-full justify-start hover:bg-amber-100"
                onClick={() => handleCommunityTabChange('following')}
              >
                <Heart className="h-4 w-4 mr-2 text-amber-500" />
                {texts.following}
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                className="text-sm w-full justify-start hover:bg-amber-100"
                onClick={() => handleCommunityTabChange('challenges')}
              >
                <DollarSign className="h-4 w-4 mr-2 text-amber-500" />
                {texts.challenges}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}