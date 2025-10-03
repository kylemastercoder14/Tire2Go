export const showTireBrandBanner = (brandName: string) => {
  switch (brandName.toLowerCase()) {
    case "comforser":
      return "https://scontent.fmnl19-1.fna.fbcdn.net/v/t39.30808-6/476633739_635931812267639_5153040531081127616_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeFKaP9SPMKuZc8A9kT_6WzXdniQ948pS4d2eJD3jylLh6D4JE0a_kSZxQUkBdi5nxaHtSuSmjqITgWbXNkJvZ3L&_nc_ohc=xugGBSl6bzYQ7kNvwE-MZyu&_nc_oc=AdlpqDFsAh9CJE6S-rYIK4ToqmZiD8SQYaMEckpKoAvYWLwp-NlzbY_jemWyIJC82VM&_nc_zt=23&_nc_ht=scontent.fmnl19-1.fna&_nc_gid=08evbl3Ezl6pZKACT_EMQw&oh=00_Afek3HWc2srbLTMDw5uLUbutCzGSmBqceHgNVq4nzDLF7w&oe=68E54A97";
    case "michelin":
      return "https://gogulong.com/wp-content/uploads/2022/02/michelin-banner-desktop-2022.jpg";
    case "dunlop":
      return "https://www.carlogos.org/tire-logos/dunlop-logo-2400x1000.png";
    case "giti":
      return "https://www.giti.com.ph/storage/images/events/Volkswagen%20World%20Record/Challenge4_world_record_attempt_car1600.jpg";
    case "roadx":
      return "https://tse1.mm.bing.net/th/id/OIP.Xm6bVojbf8n3jpeQh6Ss_gHaB6?pid=Api&P=0&h=180";
    case "falken":
      return "https://falken-tires-website-storage.s3.amazonaws.com/storage/app/media/Exports/Articles/Images/2022%20September%2001/FK460_main.jpg";
    case "sailun":
      return "https://gogulong.com/wp-content/uploads/2021/05/sailun-banner-desktop.jpg";
    case "monsta":
      return "https://tse3.mm.bing.net/th/id/OIP.x935sWMeUmWG3g40sy62xwHaCF?pid=Api&P=0&h=180";
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
