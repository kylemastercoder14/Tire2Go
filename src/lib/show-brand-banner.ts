export const showTireBrandBanner = (brandName: string) => {
  switch (brandName.toLowerCase()) {
    case "comforser":
      return "/brands/comforser.jpg";
    case "michelin":
      return "https://gogulong.com/wp-content/uploads/2022/02/michelin-banner-desktop-2022.jpg";
    case "dunlop":
      return "https://www.carlogos.org/tire-logos/dunlop-logo-2400x1000.png";
    case "giti":
      return "https://www.giti.com.ph/storage/images/events/Volkswagen%20World%20Record/Challenge4_world_record_attempt_car1600.jpg";
    case "roadx":
      return "https://tse1.mm.bing.net/th/id/OIP.Xm6bVojbf8n3jpeQh6Ss_gHaB6?pid=Api&P=0&h=180";
    case "falken":
      return "https://www.falkentyre.com/__image/a/308671/alias/xxl/v/3/c/23/ar/16-9/fn/Abrieb%20Englisch.jpg";
    case "sailun":
      return "https://gogulong.com/wp-content/uploads/2021/05/sailun-banner-desktop.jpg";
    case "monsta":
      return "https://gigaplus.makeshop.jp/tireshop4u/uploadimages/slider/monsta.jpg";
    case "roadcruza":
      return "https://chinesetyremarket.com/img-featured/Roadcruza.jpg";
    case "raiden":
      return "https://www.raidentires.com/assets-page/img/news/monster_190417_6.jpg";
    case "yokohama":
      return "https://gogulong.com/wp-content/uploads/2021/06/yokohama-banner-desktop.jpg";
    case "arivo":
      return "https://gogulong.com/wp-content/uploads/2021/07/arivo-banner-desktop.jpg";
    case "toyo tires":
      return "https://gogulong.com/wp-content/uploads/2021/05/toyo-promo-banner-desktop.jpg";
    case "radar tyres":
      return "https://dww-live-media-perma-cdn.b-cdn.net/media/magefan_blog/Are_Radar_Tires_Good.jpg";
    case "summax":
      return "https://vhost-hk-s06-cdn.hcwebsite.com/1482371bda07f1cf9f73b15eba629170/data/thumb/res/slide/1_4c325026.jpg_20250701165844_1920x0.webp?v=2OTgPArI";
    default:
      return "https://gogulong.ph/_nuxt/img/breadcrumbs-bg.f31fb0b.png";
  }
};
