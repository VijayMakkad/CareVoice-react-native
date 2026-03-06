/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary palette - warm coral/rose for care
        primary: {
          50: '#fef2f2',
          100: '#ffe1e1',
          200: '#ffc8c8',
          300: '#ffa3a3',
          400: '#ff6b6b',
          500: '#f93d3d',
          600: '#e71d1d',
          700: '#c21414',
          800: '#a01414',
          900: '#841818',
        },
        // Accent - calming teal/cyan
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // Success green
        success: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        // Warning amber
        warning: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Dark theme surface colors
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          700: '#1e293b',
          800: '#0f172a',
          900: '#020617',
          950: '#010409',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
      fontSize: {
        'body': ['18px', { lineHeight: '28px' }],
        'body-lg': ['20px', { lineHeight: '30px' }],
        'heading': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'heading-lg': ['34px', { lineHeight: '42px', fontWeight: '800' }],
        'label': ['14px', { lineHeight: '20px', fontWeight: '600' }],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      spacing: {
        'touch': '48px', // minimum touch target
      },
    },
  },
  plugins: [],
};
