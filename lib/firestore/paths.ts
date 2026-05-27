export function userDoc(uid: string) {
  return `users/${uid}`;
}

export function mealsCol(uid: string) {
  return `users/${uid}/meals`;
}

export function weightsCol(uid: string) {
  return `users/${uid}/weights`;
}

export function estimationCacheCol(uid: string) {
  return `users/${uid}/estimationCache`;
}

export function estimationCacheDoc(uid: string, normalizedText: string) {
  return `${estimationCacheCol(uid)}/${normalizedText}`;
}

export function weightDoc(uid: string, date: string) {
  return `${weightsCol(uid)}/${date}`;
}
