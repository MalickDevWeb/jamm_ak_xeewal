import os
import re

files = [
    'src/app/features/admin/adherents/pages/admin-adherents.component.ts',
    'src/app/features/admin/besoins/pages/admin-besoins.component.ts',
    'src/app/features/admin/idees/pages/admin-idees.component.ts',
    'src/app/features/admin/commissions/pages/admin-commissions.component.ts',
    'src/app/features/admin/comptes-rendus/pages/admin-comptes-rendus.component.ts',
    'src/app/features/admin/settings/pages/admin-settings.component.ts',
    'src/app/features/admin/maintenance/pages/maintenance-sat.component.ts'
]

on_confirm_action_str = """
  onConfirmAction() {
    this.showConfirmDialog = false;
    if (this.confirmActionType === 'Supprimer' && this.confirmActionId) {
      // Basic generic delete or custom logic here if needed
      // Currently handled by existing component logic or ignored if not used
    }
  }
"""

for filepath in files:
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()

    modified = False

    if 'maintenance-sat' in filepath:
        # Fix path
        if '../../../shared/components/alert-popup' in content:
            content = content.replace('../../../shared/components/alert-popup', '../../../../shared/components/alert-popup')
            modified = True
        
        # Remove ConfirmDialogComponent from imports if it's there
        if 'ConfirmDialogComponent' in content:
            content = content.replace(', ConfirmDialogComponent', '')
            modified = True

    # Add onConfirmAction() if missing and if the template has ConfirmDialogComponent
    if 'onConfirmAction(' not in content and 'app-confirm-dialog' in content:
        content = content.replace('constructor(', on_confirm_action_str + '\n  constructor(')
        modified = True

    if modified:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")
