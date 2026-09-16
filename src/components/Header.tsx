import type { Content, User } from '../types';
import { fillTemplate, formatToday } from '../utils';
import styles from './Header.module.css';

interface Props {
  content: Content;
  user: User;
  now: Date;
}

/** 인사말 + 오늘 날짜. 문구는 JSON, 날짜만 코드에서 생성한다. */
export default function Header({ content, user, now }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <span className={styles.logo}>{content.appName}</span>
        <span className={styles.date}>{formatToday(now)}</span>
      </div>
      <h1 className={styles.greeting}>
        {fillTemplate(content.greeting, { name: user.name })}
      </h1>
    </header>
  );
}
