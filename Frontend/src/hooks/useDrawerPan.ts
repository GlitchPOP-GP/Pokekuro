import { useEffect, useRef } from 'react';
import { Animated, Dimensions, PanResponder } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLLAPSED_Y = SCREEN_HEIGHT * (0.82 - 0.56);
const EXPANDED_Y = 0;

export function useDrawerPan(
  isExpanded: boolean,
  setIsExpanded: (expanded: boolean) => void
) {
  const translateY = useRef(new Animated.Value(isExpanded ? EXPANDED_Y : COLLAPSED_Y)).current;
  const lastAnimatedValue = useRef(isExpanded ? EXPANDED_Y : COLLAPSED_Y);

  useEffect(() => {
    const toValue = isExpanded ? EXPANDED_Y : COLLAPSED_Y;
    lastAnimatedValue.current = toValue;

    Animated.spring(translateY, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  }, [isExpanded, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => {
        translateY.setOffset(lastAnimatedValue.current);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const absoluteVal = lastAnimatedValue.current + gestureState.dy;
        const clampedVal = Math.min(Math.max(absoluteVal, EXPANDED_Y), COLLAPSED_Y);
        translateY.setValue(clampedVal - lastAnimatedValue.current);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();

        const isTap = Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5;
        let nextExpandedState = isExpanded;

        if (isTap) {
          nextExpandedState = !isExpanded;
        } else {
          const dragDistance = gestureState.dy;
          const velocity = gestureState.vy;

          if (isExpanded) {
            if (dragDistance > 50 || velocity > 0.5) {
              nextExpandedState = false;
            } else {
              nextExpandedState = true;
            }
          } else {
            if (dragDistance < -50 || velocity < -0.5) {
              nextExpandedState = true;
            } else {
              nextExpandedState = false;
            }
          }
        }

        const snapTarget = nextExpandedState ? EXPANDED_Y : COLLAPSED_Y;
        lastAnimatedValue.current = snapTarget;
        setIsExpanded(nextExpandedState);

        Animated.spring(translateY, {
          toValue: snapTarget,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }).start();
      },
    })
  ).current;

  return { translateY, panResponder };
}
