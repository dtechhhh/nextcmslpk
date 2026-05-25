import LayoutIndonesia from "./components/layout/LayoutIndonesia";
import LayoutJapan from "./components/layout/LayoutJapan";
import HomePageIndonesia from "./pages/indonesia/HomePage";
import ProgramPageIndonesia from "./pages/indonesia/ProgramPage";
import ProgramDetailIndonesia from "./pages/indonesia/ProgramDetail";
import JobPageIndonesia from "./pages/indonesia/JobPage";
import JobDetailIndonesia from "./pages/indonesia/JobDetail";
import BlogPageIndonesia from "./pages/indonesia/BlogPage";
import BlogDetailIndonesia from "./pages/indonesia/BlogDetail";
import OfferDetailIndonesia from "./pages/indonesia/OfferDetail";
import TentangKamiPageIndonesia from "./pages/indonesia/TentangKamiPage";
import KarirPageIndonesia from "./pages/indonesia/KarirPage";
import KarirDetailIndonesia from "./pages/indonesia/KarirDetail";
import HomePageJapan from "./pages/japan/HomePage";
import TentangKamiPageJapan from "./pages/japan/TentangKamiPage";
import MetodePelatihanPageJapan from "./pages/japan/MetodePelatihanPage";
import ProfilKandidatPageJapan from "./pages/japan/ProfilKandidatPage";
import JaringanRekrutmenPageJapan from "./pages/japan/JaringanRekrutmenPage";
import SectorPageJapan from "./pages/japan/SectorPage";
import SectorDetailJapan from "./pages/japan/SectorDetail";
import NewsPageJapan from "./pages/japan/NewsPage";
import NewsDetailJapan from "./pages/japan/NewsDetail";
import ContactPageJapan from "./pages/japan/ContactPage";
import NotFoundPage from "./pages/shared/NotFoundPage";
import SuspendedPage from "./pages/shared/SuspendedPage";
import UnavailablePage from "./pages/shared/UnavailablePage";

export const starterTheme = {
  key: "starter",
  name: "Starter Theme",
  indonesia: {
    layout: LayoutIndonesia,
    pages: {
      homepage: HomePageIndonesia,
      program_page: ProgramPageIndonesia,
      program_detail: ProgramDetailIndonesia,
      job_page: JobPageIndonesia,
      job_detail: JobDetailIndonesia,
      blog_page: BlogPageIndonesia,
      blog_detail: BlogDetailIndonesia,
      offer_detail: OfferDetailIndonesia,
      tentang_kami: TentangKamiPageIndonesia,
      karir_page: KarirPageIndonesia,
      karir_detail: KarirDetailIndonesia,
    },
  },
  japan: {
    layout: LayoutJapan,
    pages: {
      homepage: HomePageJapan,
      tentang_kami: TentangKamiPageJapan,
      metode_pelatihan: MetodePelatihanPageJapan,
      profil_kandidat: ProfilKandidatPageJapan,
      jaringan_rekrutmen: JaringanRekrutmenPageJapan,
      sector_page: SectorPageJapan,
      sector_detail: SectorDetailJapan,
      news_page: NewsPageJapan,
      news_detail: NewsDetailJapan,
      contact: ContactPageJapan,
    },
  },
  shared: {
    notFound: NotFoundPage,
    suspended: SuspendedPage,
    unavailable: UnavailablePage,
  },
};

export type ThemeRegistry = typeof starterTheme;

export default starterTheme;
