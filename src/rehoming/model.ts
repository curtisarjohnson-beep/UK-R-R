export type Availability = 'available' | 'reserved' | 'rehomed'
export type Publication = 'draft' | 'published'
export type EventType = 'available' | 'reserved' | 'rehomed'
export type PostStatus = 'pending' | 'approved' | 'publishing' | 'published' | 'failed' | 'rejected'
export interface PhotoRef { id: string; name: string; source?: string }
export interface Animal {
  id: string; revision: number; name: string; species: string; age: string; sex: string;
  personality: string; description: string; background: string; care: string; specialNeeds: string;
  availability: Availability; publication: Publication; archived: boolean; photos: PhotoRef[];
  primaryPhotoId: string; introduced: boolean; createdAt: string; updatedAt: string;
}
export interface SocialTemplate { type: EventType; title: string; text: string; revision: number }
export interface SocialPost {
  id: string; revision: number; eventId: string; animalId: string; animalName: string; event: EventType;
  photos: PhotoRef[]; photoId: string; caption: string; generatedCaption: string; profileUrl: string;
  status: PostStatus; createdAt: string; updatedAt: string; approvedAt?: string; approvedBy?: string;
  attemptId?: string; error?: string;
}
export interface PublishHistory {
  id: string; postId: string; animalName: string; action: PostStatus; at: string; actor: string;
  caption: string; photoId: string; simulated: true; error?: string;
}
export interface Snapshot { version: 1; animals: Animal[]; templates: SocialTemplate[]; posts: SocialPost[]; events: string[]; history: PublishHistory[] }
export interface DemoSession { name: string; demo: true; authenticated: false }
export interface AnimalService {
  list(): Promise<Animal[]>; get(id: string): Promise<Animal | undefined>;
  save(animal: Animal): Promise<Animal>; archive(id: string, revision: number): Promise<boolean>;
  remove(id: string, revision: number): Promise<boolean>;
}
export interface PhotoService { upload(file: File): Promise<PhotoRef>; blob(photo: PhotoRef): Promise<Blob> }
export interface TemplateService { save(template: SocialTemplate): Promise<SocialTemplate>; restore(type: EventType): Promise<SocialTemplate> }
export interface PostService {
  save(post: SocialPost): Promise<SocialPost>;
  review(id: string, revision: number, action: 'approve' | 'reject' | 'reopen'): Promise<SocialPost>;
  beginPublish(id: string, revision: number): Promise<SocialPost>;
  finishPublish(id: string, attemptId: string, fail: boolean): Promise<SocialPost>;
  recoverPublish(id: string): Promise<SocialPost>;
}
export interface HistoryService { list(): Promise<PublishHistory[]> }
export interface AuthService { session(): Promise<DemoSession>; requireAdmin(): Promise<DemoSession> }
export interface Services {
  animals: AnimalService; photos: PhotoService; templates: TemplateService; posts: PostService;
  history: HistoryService; auth: AuthService; snapshot(): Promise<Snapshot>; reset(): Promise<void>;
  subscribe(listener: () => void): () => void;
}
export const availabilityLabels: Record<Availability, string> = { available: 'Available', reserved: 'Reserved', rehomed: 'Rehomed' }
export const postLabels: Record<PostStatus, string> = { pending: 'Pending Approval', approved: 'Approved', publishing: 'Publishing', published: 'Published (simulated)', failed: 'Failed (simulated)', rejected: 'Rejected' }
export const placeholders = ['name', 'species', 'age', 'sex', 'personality', 'description', 'profile_url'] as const
export function emptyAnimal(): Animal {
  return { id: '', revision: 0, name: '', species: '', age: '', sex: '', personality: '', description: '', background: '', care: '', specialNeeds: '', availability: 'available', publication: 'draft', archived: false, photos: [], primaryPhotoId: '', introduced: false, createdAt: '', updatedAt: '' }
}
export function primaryPhoto(animal: Animal) { return animal.photos.find(p => p.id === animal.primaryPhotoId) || animal.photos[0] }
