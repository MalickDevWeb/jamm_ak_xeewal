/**
 * Utilitaires de validation frontend partagés.
 *
 * Ces fonctions sont utilisées pour la validation de premier niveau
 * (côté client) avant tout appel API. Elles ne remplacent PAS la
 * validation backend, mais permettent d'éviter des requêtes inutiles
 * et d'offrir un feedback immédiat à l'utilisateur.
 *
 * Contexte : numéros de téléphone sénégalais au format +221XXXXXXXXX
 * (9 chiffres après l'indicatif, opérateurs : 77, 78, 76, 70, 75).
 */

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

// Préfixes d'opérateurs sénégalais autorisés
const SN_OPERATOR_PREFIXES = ['77', '78', '76', '70', '75'];

/**
 * Nettoie un numéro de téléphone en supprimant espaces, tirets et parenthèses.
 * Retourne uniquement les chiffres (sans l'indicatif +221).
 */
export function cleanPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  return String(phone).replace(/[\s\-().]/g, '');
}

/**
 * Valide un numéro de téléphone sénégalais.
 *
 * Formats acceptés :
 *  - 9 chiffres : 771234567
 *  - +221 suivi de 9 chiffres : +221771234567
 *  - 00221 suivi de 9 chiffres : 00221771234567
 *
 * Vérifie que le numéro commence par un préfixe d'opérateur sénégalais valide.
 */
export function validateSenegalPhone(phone: string | null | undefined): ValidationResult {
  if (!phone || !String(phone).trim()) {
    return { valid: false, message: 'Le numéro de téléphone est obligatoire.' };
  }

  const cleaned = cleanPhoneNumber(phone);

  // Retirer les indicatifs internationaux pour ne garder que les chiffres locaux
  let local = cleaned;
  if (local.startsWith('00221') && local.length === 14) {
    local = local.substring(5);
  } else if (local.startsWith('221') && local.length === 12) {
    local = local.substring(3);
  }

  if (!/^\d{9}$/.test(local)) {
    return { valid: false, message: 'Le numéro doit contenir 9 chiffres (ex : 77 123 45 67).' };
  }

  const prefix = local.substring(0, 2);
  if (!SN_OPERATOR_PREFIXES.includes(prefix)) {
    return {
      valid: false,
      message: 'Préfixe "' + prefix + '" non reconnu. Utilisez un numéro sénégalais valide (77, 78, 76, 70, 75).',
    };
  }

  return { valid: true };
}

/**
 * Normalise un numéro de téléphone au format international +221XXXXXXXXX.
 * Retourne le numéro normalisé ou null si invalide.
 */
export function normalizeSenegalPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const v = validateSenegalPhone(phone);
  if (!v.valid) return null;
  const cleaned = cleanPhoneNumber(phone);
  let local = cleaned;
  if (local.startsWith('00221') && local.length === 14) local = local.substring(5);
  else if (local.startsWith('221') && local.length === 12) local = local.substring(3);
  return '+221' + local;
}

/**
 * Valide un champ texte obligatoire (prénom, nom, etc.).
 * Renvoie un message d'erreur si invalide, null sinon.
 */
export function requireText(value: string | null | undefined, label: string = 'Ce champ'): string | null {
  if (!value || !String(value).trim()) {
    return label + ' est obligatoire.';
  }
  if (String(value).trim().length < 2) {
    return label + ' doit contenir au moins 2 caractères.';
  }
  if (String(value).trim().length > 80) {
    return label + ' ne peut pas dépasser 80 caractères.';
  }
  return null;
}

/**
 * Valide un mot de passe : minimum 6 caractères, max 128.
 * Renvoie un message d'erreur ou null.
 */
export function validatePassword(password: string | null | undefined, minLength: number = 6): string | null {
  if (!password) {
    return 'Le mot de passe est obligatoire.';
  }
  if (password.length < minLength) {
    return 'Le mot de passe doit contenir au moins ' + minLength + ' caractères.';
  }
  if (password.length > 128) {
    return 'Le mot de passe ne peut pas dépasser 128 caractères.';
  }
  return null;
}

/**
 * Valide qu'une date de fin est postérieure ou égale à une date de début.
 * Format attendu : YYYY-MM-DD (renvoyé par les input type="date").
 */
export function validateDateRange(startDate: string, endDate: string): string | null {
  if (!startDate || !endDate) return null; // pas de range complet → pas d'erreur
  if (startDate > endDate) {
    return 'La date de fin doit être postérieure ou égale à la date de début.';
  }
  return null;
}

/**
 * Valide un fichier image (taille + type MIME).
 * Retourne un message d'erreur ou null.
 */
export function validateImageFile(file: File | null | undefined, maxSizeMB: number = 5): string | null {
  if (!file) return 'Aucune image sélectionnée.';
  if (!file.type || !file.type.startsWith('image/')) {
    return 'Veuillez sélectionner une image (JPG, PNG, WEBP).';
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return 'L\'image est trop lourde (max ' + maxSizeMB + 'MB).';
  }
  return null;
}
