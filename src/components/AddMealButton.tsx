import styles from './AddMealButton.module.css';

interface Props {
  label: string;
  hint: string;
  /** 누르면 state 의 meals 에 한 끼가 추가된다 → 화면 전체가 다시 그려진다 */
  onAdd: () => void;
}

/**
 * 핵심 플로우의 시작점.
 * 실제 카메라 대신, AI가 사진을 인식한 결과(JSON aiScanSamples)를 한 건 추가한다.
 */
export default function AddMealButton({ label, hint, onAdd }: Props) {
  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.button} onClick={onAdd}>
        <span className={styles.icon} aria-hidden="true">
          📷
        </span>
        {label}
      </button>
      <p className={styles.hint}>{hint}</p>
    </div>
  );
}
