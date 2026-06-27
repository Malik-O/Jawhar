import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic, Amiri } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { arSA } from '@clerk/localizations';
import { dark } from '@clerk/themes';
import './globals.css';
import 'react-tooltip/dist/react-tooltip.css';

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-quran',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'جَوْهَر — تحويل المحاضرات إلى ملخصات بالذكاء الاصطناعي',
  description:
    'جَوْهَر: أداة مجانية لتحويل المحاضرات الصوتية والمرئية إلى ملخصات منظمة باللغة العربية باستخدام الذكاء الاصطناعي',
};

// Add custom Arabic translations for missing placeholders in the default arSA locale
const customArSA = {
  ...arSA,
  formFieldInputPlaceholder__emailAddress: 'أدخل بريدك الإلكتروني',
  formFieldInputPlaceholder__password: 'أدخل كلمة المرور',
  formFieldInputPlaceholder__firstName: 'الاسم الأول',
  formFieldInputPlaceholder__lastName: 'اسم العائلة',
  formFieldInputPlaceholder__username: 'اسم المستخدم',
  formFieldInputPlaceholder__phoneNumber: 'رقم الهاتف',
  formFieldInputPlaceholder__emailAddress_username: 'البريد الإلكتروني أو اسم المستخدم',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={customArSA}
      appearance={{

        baseTheme: dark,
        variables: {
          colorPrimary: '#FF9800',
          colorBackground: '#1a1a1a',
          colorDanger: '#ff3333',
          colorSuccess: '#00C8C8',
          colorWarning: '#FF9800',
          colorNeutral: '#E0E0E0',
          colorForeground: '#E0E0E0',
          colorMutedForeground: '#808080',
          colorInput: '#161616',
          colorInputForeground: '#E0E0E0',
          colorPrimaryForeground: '#101010',
          colorShimmer: '#333333',
          borderRadius: '10px',
          fontFamily: 'inherit',
        },
        elements: {
          cardBox: { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', borderRadius: '20px' },
          card: { background: '#1a1a1a', border: 'none', boxShadow: 'none' },
          scrollBox: { background: '#1a1a1a' },
          pageScrollBox: { background: '#1a1a1a' },
          page: { background: '#1a1a1a' },
          navbar: { background: '#141414', borderRight: '1px solid rgba(255,255,255,0.06)' },
          navbarButton: { color: '#B0B0B0' },
          navbarButtonIcon: { color: '#808080' },
          'navbarButton__active': { color: '#FF9800', background: 'rgba(255,152,0,0.08)' },
          headerTitle: { color: '#E0E0E0', fontWeight: '700' },
          headerSubtitle: { color: '#B0B0B0' },
          profileSection: { borderBottom: '1px solid rgba(255,255,255,0.06)' },
          profileSectionTitle: { color: '#808080', borderBottom: '1px solid rgba(255,255,255,0.06)' },
          profileSectionTitleText: { color: '#808080' },
          profileSectionContent: { color: '#E0E0E0' },
          profileSectionPrimaryButton: { color: '#FF9800' },
          accordionTriggerButton: { color: '#E0E0E0' },
          accordionContent: { background: '#141414', borderTop: '1px solid rgba(255,255,255,0.06)' },
          formFieldLabel: { color: '#B0B0B0' },
          formFieldInput: { background: '#161616', border: '1px solid rgba(255,255,255,0.10)', color: '#E0E0E0' },
          formFieldInputShowPasswordButton: { color: '#808080' },
          formFieldAction: { color: '#FF9800' },
          formFieldErrorText: { color: '#ff3333' },
          formFieldSuccessText: { color: '#00C8C8' },
          formFieldHintText: { color: '#808080' },
          formFieldInfoText: { color: '#808080' },
          formButtonPrimary: { background: 'linear-gradient(135deg, #FFB74D, #FF9800)', color: '#101010', fontWeight: '600', border: 'none', boxShadow: '0 4px 12px rgba(255,152,0,0.3)' },
          formButtonReset: { color: '#FF9800' },
          formResendCodeLink: { color: '#FF9800' },
          socialButtonsBlockButton: { background: '#161616', border: '1px solid rgba(255,255,255,0.10)', color: '#E0E0E0', transition: 'all 0.2s' },
          socialButtonsBlockButtonText: { color: '#E0E0E0' },
          socialButtonsProviderIcon: { filter: 'brightness(0) invert(1)' },
          footer: { background: 'transparent' },
          footerAction: { color: '#B0B0B0' },
          footerActionText: { color: '#B0B0B0' },
          footerActionLink: { color: '#FF9800' },
          footerPages: { color: '#808080' },
          footerPagesLink: { color: '#808080', '&:hover': { color: '#E0E0E0' } },
          dividerLine: { background: 'rgba(255,255,255,0.08)' },
          dividerText: { color: '#808080' },
          identityPreviewText: { color: '#E0E0E0' },
          identityPreviewEditButton: { color: '#FF9800' },
          otpCodeFieldInput: { background: '#161616', border: '1px solid rgba(255,255,255,0.10)', color: '#E0E0E0' },
          alternativeMethodsBlockButton: { color: '#E0E0E0', border: '1px solid rgba(255,255,255,0.10)' },
          badge: { background: 'rgba(255,152,0,0.12)', color: '#FF9800', border: '1px solid rgba(255,152,0,0.25)' },
          tagInputContainer: { background: '#161616', border: '1px solid rgba(255,255,255,0.10)' },
          buttonArrowIcon: { color: '#808080' },
          menuButton: { color: '#E0E0E0' },
          menuList: { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' },
          menuItem: { color: '#E0E0E0' },
          'menuItem:hover': { background: 'rgba(255,152,0,0.08)' },
          actionCard: { background: '#161616', border: '1px solid rgba(255,255,255,0.08)' },
          providerIcon__github: { filter: 'invert(1)' },
          providerIcon__apple: { filter: 'invert(1)' },
          userButtonPopoverCard: { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' },
          userButtonPopoverActionButton: { color: '#E0E0E0' },
          userButtonPopoverActionButtonIcon: { color: '#808080' },
          userButtonPopoverActionButtonText: { color: '#E0E0E0' },
          userButtonPopoverFooter: { borderTop: '1px solid rgba(255,255,255,0.06)' },
          userPreviewMainIdentifier: { color: '#E0E0E0' },
          userPreviewSecondaryIdentifier: { color: '#808080' },
          modalBackdrop: { background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' },
          modalContent: { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' },
          modalCloseButton: { color: '#808080', '&:hover': { color: '#E0E0E0' } },
          selectButton: { background: '#161616', color: '#E0E0E0', border: '1px solid rgba(255,255,255,0.10)' },
          selectOptionsContainer: { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' },
          selectOption: { color: '#E0E0E0', '&[data-highlighted]': { background: 'rgba(255,152,0,0.08)' } },
          fileDropAreaBox: { background: '#161616', border: '1px dashed rgba(255,255,255,0.10)' },
          fileDropAreaHint: { color: '#808080' },
          fileDropAreaButtonPrimary: { color: '#FF9800' },
          activeDeviceListItem: { background: '#161616', border: '1px solid rgba(255,255,255,0.08)' },
          tabButton: { color: '#808080', '&[data-active="true"]': { color: '#FF9800' } },
          tabListContainer: { borderBottom: '1px solid rgba(255,255,255,0.06)' },
          // Specific styling for the 'Secured by Clerk' branding
          clerkLogo: { filter: 'brightness(0.6) sepia(1) hue-rotate(180deg) saturate(0)' }, // make it gray
          organizationSwitcherTrigger: { color: '#E0E0E0' },
        },
      } as any}
    >
      <html lang="ar" dir="rtl" className={`${ibmPlexArabic.variable} ${amiri.variable}`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
