import Link from 'next/link';
import cn from 'clsx';

type UserUsernameProps = {
  username: string;
  className?: string;
  disableLink?: boolean;
};

export function UserUsername({
  username,
  className,
  disableLink
}: UserUsernameProps): JSX.Element {
  if (disableLink) {
    return (
      <span
        className={cn(
          'truncate text-light-secondary dark:text-dark-secondary',
          className
        )}
      >
        @{username}
      </span>
    );
  }

  return (
    <Link href={`/user/${username}`}>
      <a
        className={cn(
          'truncate text-light-secondary dark:text-dark-secondary',
          className
        )}
        tabIndex={-1}
      >
        @{username}
      </a>
    </Link>
  );
}
