const labels={
  tr:{allMenu:'TÜM MENÜ',onlineMenu:'ONLINE MENÜ',storeMenu:'MAĞAZA MENÜ',regionTitle:'Bölge ve dil seçin',regionLabel:'Bölge / Dil Seçiniz:',country:'Teslimat ülkesi',language:'Dil',save:'KAYDET VE DEVAM ET',translationNote:'Çevrilmemiş içerikler Türkçe gösterilir.',stores:'Mağazalarımız',contact:'İletişim'},
  en:{allMenu:'ALL MENU',onlineMenu:'ONLINE MENU',storeMenu:'STORE MENU',regionTitle:'Choose your region and language',regionLabel:'Region / Language:',country:'Delivery country',language:'Language',save:'SAVE AND CONTINUE',translationNote:'Content without a translation is displayed in Turkish.',stores:'Our Stores',contact:'Contact'},
  ar:{allMenu:'القائمة الكاملة',onlineMenu:'القائمة الإلكترونية',storeMenu:'قائمة المتاجر',regionTitle:'اختر المنطقة واللغة',regionLabel:'المنطقة / اللغة:',country:'بلد التوصيل',language:'اللغة',save:'احفظ وتابع',translationNote:'يظهر المحتوى غير المترجم باللغة التركية.',stores:'متاجرنا',contact:'اتصل بنا'}
};
export const ui=(language,key)=>labels[language]?.[key]||labels.tr[key]||key;
