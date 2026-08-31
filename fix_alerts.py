import os

files = [
    'src/app/features/admin/messages/pages/admin-messages.component.ts',
    'src/app/features/admin/sondages/pages/admin-sondages.component.ts',
    'src/app/features/admin/maintenance/pages/maintenance-sat.component.ts',
    'src/app/features/admin/adherents/pages/admin-adherents.component.ts',
    'src/app/features/admin/besoins/pages/admin-besoins.component.ts',
    'src/app/features/admin/idees/pages/admin-idees.component.ts',
    'src/app/features/admin/commissions/pages/admin-commissions.component.ts',
    'src/app/features/admin/comptes-rendus/pages/admin-comptes-rendus.component.ts',
    'src/app/features/admin/settings/pages/admin-settings.component.ts',
    'src/app/features/admin/editorial/pages/admin-editorial.component.ts',
    'src/app/features/admin/evenements/pages/admin-evenements.component.ts',
    'src/app/features/admin/visites/pages/admin-visites.component.ts'
]

for filepath in files:
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()

    modified = False

    # Fix bindings
    if '[show]="showAlertPopup"' in content:
        content = content.replace('[show]="showAlertPopup"', '[visible]="showAlertPopup"')
        content = content.replace('(closed)="showAlertPopup = false"', '(close)="showAlertPopup = false"')
        modified = True

    if '[show]="showConfirmDialog"' in content:
        content = content.replace('[show]="showConfirmDialog"', '[visible]="showConfirmDialog"')
        modified = True

    if modified:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")
