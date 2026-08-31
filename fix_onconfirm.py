import os

files = [
    'src/app/features/admin/adherents/pages/admin-adherents.component.ts',
    'src/app/features/admin/besoins/pages/admin-besoins.component.ts',
    'src/app/features/admin/idees/pages/admin-idees.component.ts',
    'src/app/features/admin/commissions/pages/admin-commissions.component.ts',
    'src/app/features/admin/comptes-rendus/pages/admin-comptes-rendus.component.ts',
    'src/app/features/admin/settings/pages/admin-settings.component.ts'
]

on_confirm_action_str = """
  onConfirmAction() {
    this.showConfirmDialog = false;
    if (this.confirmActionType === 'Supprimer' && this.confirmActionId) {
      // Logic handled via specific action if needed
    }
  }
"""

for filepath in files:
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()

    modified = False

    # Add onConfirmAction() if missing
    if 'onConfirmAction(' not in content:
        content = content.replace('constructor(', on_confirm_action_str + '\n  constructor(')
        modified = True

    if modified:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed onConfirmAction in {filepath}")

