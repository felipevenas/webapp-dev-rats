import { useNavigation } from 'react-router-dom';

/** Thin top bar shown while a lazy route or loader is resolving. */
export function NavigationProgress() {
  const navigation = useNavigation();
  const active = navigation.state !== 'idle';

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden bg-transparent"
    >
      <div
        className={
          active
            ? 'h-full w-1/3 animate-[progress-slide_1s_ease-in-out_infinite] bg-volt shadow-[0_0_8px_var(--ds-volt)]'
            : 'h-full w-0 bg-volt'
        }
      />
    </div>
  );
}
