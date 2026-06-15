import Link from 'next/link';
import cn from 'clsx';
import { NextImage } from '@components/ui/next-image';

type UserAvatarProps = {
  src: string;
  alt: string;
  size?: number;
  username?: string;
  className?: string;
  disableLink?: boolean;
};

export function UserAvatar({
  src,
  alt,
  size,
  username,
  className,
  disableLink
}: UserAvatarProps): JSX.Element {
  const pictureSize = size ?? 48;

  const inner = (
    <NextImage
      useSkeleton
      imgClassName='rounded-full'
      width={pictureSize}
      height={pictureSize}
      src={src}
      alt={alt}
      key={src}
    />
  );

  if (disableLink || !username) {
    return <div className={cn('flex self-start', className)}>{inner}</div>;
  }

  return (
    <Link href={`/user/${username}`}>
      <a className={cn('blur-picture flex self-start', className)} tabIndex={0}>
        {inner}
      </a>
    </Link>
  );
}
