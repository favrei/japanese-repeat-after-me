from __future__ import annotations

import unittest

import numpy as np

from ml_only_eval.augment import AUGMENTATION_NAMES, augment


class AugmentationTests(unittest.TestCase):
    def test_every_condition_is_deterministic_for_a_fixed_seed(self) -> None:
        time_axis = np.linspace(0, 1, 16_000, endpoint=False)
        signal = (0.2 * np.sin(2 * np.pi * 220 * time_axis)).astype(np.float32)
        donor = (0.2 * np.sin(2 * np.pi * 330 * time_axis)).astype(np.float32)

        for name in AUGMENTATION_NAMES:
            with self.subTest(name=name):
                first = augment(signal, name, 42, donor=donor)
                second = augment(signal, name, 42, donor=donor)
                np.testing.assert_array_equal(first, second)
                self.assertTrue(np.all(np.isfinite(first)))

    def test_augmentation_does_not_mutate_source_audio(self) -> None:
        signal = np.linspace(-0.2, 0.2, 16_000, dtype=np.float32)
        original = signal.copy()

        augment(signal, "packet_dropouts", 42, donor=original)

        np.testing.assert_array_equal(signal, original)
