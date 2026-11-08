import type { Challenge, GroupMember } from '@/core/types/api';
import { todayInZone } from '@/core/lib/date';
import { useStudyPhotos } from '@/features/studies/data/use-studies';
import { StudyPhotoGallery } from '@/features/studies/ui/study-photo-gallery';
import { StudyPhotoUploader } from '@/features/studies/ui/study-photo-uploader';

interface StudyPhotosTabProps {
  challenge: Challenge;
  members: GroupMember[];
  currentUserId: string;
}

export function StudyPhotosTab({ challenge, members, currentUserId }: StudyPhotosTabProps) {
  const today = todayInZone(challenge.timezone);
  const todayQuery = useStudyPhotos(
    challenge.id,
    { userId: currentUserId, date: today, size: 1 },
    challenge.status === 'ACTIVE',
  );
  const todayPhoto = todayQuery.data?.content[0] ?? null;

  return (
    <div className="space-y-4">
      <StudyPhotoUploader
        challengeId={challenge.id}
        todayPhoto={todayPhoto}
        active={challenge.status === 'ACTIVE'}
      />
      <StudyPhotoGallery
        challengeId={challenge.id}
        members={members}
        currentUserId={currentUserId}
        timezone={challenge.timezone}
      />
    </div>
  );
}
