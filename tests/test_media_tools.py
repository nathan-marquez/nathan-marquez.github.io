import sys
from pathlib import Path
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'scripts'))
import optimize_media


class DisplayDimensionsTest(unittest.TestCase):
    def test_rotated_phone_video_reserves_portrait_space(self):
        self.assertTrue(hasattr(optimize_media, 'display_dimensions'), 'Video dimensions must account for display rotation')
        cases = [(0, (3840, 2160)), (-90, (2160, 3840)), (90, (2160, 3840)), (180, (3840, 2160))]
        for rotation, expected in cases:
            with self.subTest(rotation=rotation):
                stream = {'width': 3840, 'height': 2160, 'side_data_list': [{'side_data_type': 'Display Matrix', 'rotation': rotation}]}
                self.assertEqual(optimize_media.display_dimensions(stream), expected)


if __name__ == '__main__':
    unittest.main()
