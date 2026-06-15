import cn from 'clsx';
import Link from 'next/link';
import { HeroIcon } from '@components/ui/hero-icon';

type UserNameProps = {
  tag?: keyof JSX.IntrinsicElements;
  name: string;
  verified: boolean;
  username?: string;
  className?: string;
  iconClassName?: string;
  disableLink?: boolean;
};

export function UserName({
  tag,
  name,
  verified,
  username,
  className,
  iconClassName,
  disableLink
}: UserNameProps): JSX.Element {
  const CustomTag = tag ? tag : 'p';

  const inner = (
    <>
      <CustomTag className='truncate'>{name}</CustomTag>
      {verified && (
        <i>
          <HeroIcon
            className={cn('fill-accent-blue', iconClassName ?? 'h-5 w-5')}
            iconName='CheckBadgeIcon'
            solid
          />
        </i>
      )}
    </>
  );

  if (disableLink || !username) {
    return (
      <div
        className={cn('flex items-center gap-1 truncate font-bold', className)}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link href={`/user/${username}`}>
      <a
        className={cn(
          'custom-underline flex items-center gap-1 truncate font-bold',
          className
        )}
        tabIndex={0}
      >
        {inner}
      </a>
    </Link>
  );
}
