import { ProfileIcon } from '@/components/core/icons';
import { SideBarRoute } from '.';

export const rightAdminRoutes: SideBarRoute[] = [
  {
    name: 'Profile',
    path: '/admin/profile',
    icon: ProfileIcon,
  },
];
export const rightStudentRoutes: SideBarRoute[] = [
  {
    name: 'Profile',
    path: '/student/profile',
    icon: ProfileIcon,
  },
];
