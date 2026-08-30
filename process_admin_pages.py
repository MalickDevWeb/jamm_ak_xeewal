import os

files = [
    '/home/pmt/Téléchargements/JAMM_AK_XEEWAL-1/jamm-angular/src/app/features/admin/adherents/pages/admin-adherents.component.html',
    '/home/pmt/Téléchargements/JAMM_AK_XEEWAL-1/jamm-angular/src/app/features/admin/idees/pages/admin-idees.component.html',
    '/home/pmt/Téléchargements/JAMM_AK_XEEWAL-1/jamm-angular/src/app/features/admin/messages/pages/admin-messages.component.html'
]

replacements = {
    'bg-white ': 'bg-white/10 backdrop-blur-2xl ',
    'bg-white/': 'bg-white/', # prevent nested replacements
    'bg-gray-50/50': 'bg-black/30',
    'bg-gray-50': 'bg-white/5',
    'bg-gray-100': 'bg-white/10',
    'bg-gray-200': 'bg-white/20',
    'border-gray-100': 'border-white/10',
    'border-gray-200': 'border-white/20',
    'border-gray-300': 'border-white/30',
    'text-gray-900': 'text-white',
    'text-gray-800': 'text-white',
    'text-gray-700': 'text-gray-200',
    'text-gray-600': 'text-gray-300',
    'text-gray-500': 'text-gray-400',
    'hover:bg-gray-50': 'hover:bg-white/10',
    'hover:text-gray-900': 'hover:text-brand-yellow',
    'bg-brand-green text-white': 'bg-gradient-to-r from-brand-yellow to-yellow-500 text-brand-dark border border-yellow-300 shadow-[0_15px_30px_-10px_rgba(245,158,11,0.6)]',
    'bg-brand-green hover:bg-brand-greenLight': 'bg-brand-yellow hover:bg-yellow-400 text-brand-dark',
    'divide-gray-200': 'divide-white/20',
    'divide-gray-100': 'divide-white/10',
    'shadow-sm': 'shadow-lg',
    'bg-white rounded-2xl': 'bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20',
    'bg-white rounded-3xl': 'bg-[#0a1910] border border-white/10 rounded-3xl text-white',
    'text-brand-dark': 'text-brand-yellow'
}

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            content = f.read()
        
        for old, new in replacements.items():
            if old != 'bg-white/' and old != 'text-brand-dark': # special logic
                content = content.replace(old, new)
                
        # Fix table headers specifically
        content = content.replace('bg-gray-50', 'bg-white/5')
        content = content.replace('text-gray-500', 'text-gray-300')
        content = content.replace('bg-white', 'bg-transparent')
        content = content.replace('bg-transparent/10', 'bg-white/10')
        
        with open(file_path, 'w') as f:
            f.write(content)
