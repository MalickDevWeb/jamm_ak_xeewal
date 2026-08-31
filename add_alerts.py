import os
import re

files = [
    'src/app/features/admin/messages/pages/admin-messages.component.ts',
    'src/app/features/admin/sondages/pages/admin-sondages.component.ts',
    'src/app/features/admin/maintenance/pages/maintenance-sat.component.ts',
    'src/app/features/admin/adherents/pages/admin-adherents.component.ts',
    'src/app/features/admin/besoins/pages/admin-besoins.component.ts',
    'src/app/features/admin/idees/pages/admin-idees.component.ts',
    'src/app/features/admin/commissions/pages/admin-commissions.component.ts',
    'src/app/features/admin/comptes-rendus/pages/admin-comptes-rendus.component.ts',
    'src/app/features/admin/settings/pages/admin-settings.component.ts'
]

imports_alert = "import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';\n"
imports_confirm = "import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';\n"
imports_alert_maintenance = "import { AlertPopupComponent, AlertType } from '../../../shared/components/alert-popup/alert-popup.component';\n"

template_alert = """
    <!-- Alert Popup -->
    <app-alert-popup 
      [message]="alertMessage" 
      [type]="alertType" 
      [show]="showAlertPopup" 
      (closed)="showAlertPopup = false">
    </app-alert-popup>
"""

template_confirm = """
    <!-- Confirm Dialog -->
    <app-confirm-dialog
      [title]="confirmTitle"
      [message]="confirmMessage"
      [show]="showConfirmDialog"
      (confirm)="onConfirmAction()"
      (cancel)="showConfirmDialog = false">
    </app-confirm-dialog>
"""

state_vars = """
  // Alert State
  alertMessage = '';
  alertType: AlertType = 'success';
  showAlertPopup = false;

  showAlert(message: string, type: AlertType = 'success') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlertPopup = true;
    setTimeout(() => this.showAlertPopup = false, 3000);
  }

  // Confirm State
  showConfirmDialog = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmActionType = '';
  confirmActionId: any = null;

  openConfirm(title: string, message: string, actionType: string, id: any = null) {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmActionType = actionType;
    this.confirmActionId = id;
    this.showConfirmDialog = true;
  }
"""

for filepath in files:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} (not found)")
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()

    modified = False

    # 1. Add imports if missing
    if 'AlertPopupComponent' not in content:
        if 'maintenance-sat' in filepath:
            content = content.replace("import { Component", imports_alert_maintenance + "import { Component")
        else:
            content = content.replace("import { Component", imports_alert + "import { Component")
        modified = True

    if 'ConfirmDialogComponent' not in content:
        if 'maintenance-sat' not in filepath: # We may not need confirm in maintenance
            content = content.replace("import { Component", imports_confirm + "import { Component")
        modified = True

    # 2. Add to @Component imports array
    if 'AlertPopupComponent' not in content.split('imports: [')[1].split(']')[0]:
        content = re.sub(r'imports:\s*\[([^\]]+)\]', lambda m: f"imports: [{m.group(1).rstrip()}, AlertPopupComponent, ConfirmDialogComponent]", content, count=1)
        modified = True

    # Clean up duplicate ConfirmDialogComponent if it was already there but we just appended
    content = content.replace(', ConfirmDialogComponent, ConfirmDialogComponent', ', ConfirmDialogComponent')

    # 3. Add to template
    if 'app-alert-popup' not in content:
        content = content.replace('<div class="animate-fade-in-up max-w-[1600px] mx-auto">', '<div class="animate-fade-in-up max-w-[1600px] mx-auto">\n' + template_alert)
        modified = True
    
    if 'app-confirm-dialog' not in content and 'maintenance-sat' not in filepath:
        content = content.replace('</app-alert-popup>', '</app-alert-popup>\n' + template_confirm)
        modified = True

    # 4. Add state vars
    if 'showAlert(' not in content:
        content = content.replace('constructor(', state_vars + '\n  constructor(')
        modified = True

    # 5. Replace alert() and confirm()
    if "alert(" in content:
        content = re.sub(r'alert\((.*?)\)', r'this.showAlert(\1, \'info\')', content)
        modified = True

    if modified:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Modified {filepath}")
