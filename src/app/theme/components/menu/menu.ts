import { Menu } from './menu.model';

export const verticalMenuItems = [
  new Menu(1, 'Dashboard', '/pages/dashboard', null, 'dashboard', null, false, 0),
  new Menu(2, 'Assets', null, null, 'leaf', null, true, 0),
  new Menu(20, 'Assets List', '/pages/Assets', null, 'reorder', null, false, 2),
  new Menu(21, 'Element List', '/pages/Element', null, 'clone', null, false, 2),
  new Menu(22, 'Inspection List', '/pages/Inspection', null, 'bookmark-o', null, false, 2),
  new Menu(3, 'Vehicle', null, null, 'cab', null, true, 0),
  new Menu(30, 'Vehicle List', '/pages/VehicleList', null, 'reorder', null, false, 3),
  new Menu(31, 'Vehicle Inspection', '/pages/VehicleInspection', null, 'bookmark-o', null, false, 3),
  new Menu(32, 'Vehicle CheckList', '/pages/VehicleChecklist', null, 'check-circle-o', null, false, 3)
];

export const horizontalMenuItems = [
  new Menu(1, 'Dashboard', '/pages/dashboard', null, 'dashboard', null, false, 0),
    new Menu(2, 'Assets', null, null, 'leaf', null, true, 0),
    new Menu(20, 'Assets List', '/pages/Assets', null, 'reorder', null, false, 2),
    new Menu(21, 'Element List', '/pages/Element', null, 'clone', null, false, 2),
    new Menu(22, 'Inspection List', '/pages/Inspection', null, 'bookmark-o', null, false, 2),
    new Menu(3, 'Vehicle', null, null, 'cab', null, true, 0),
    new Menu(30, 'Vehicle List', null, '/pages/VehicleList', 'reorder', null, false, 3),
    new Menu(31, 'Vehicle Inspection', '/pages/VehicleInspection', null, 'bookmark-o', null, false, 3),
    new Menu(32, 'Vehicle CheckList', '/pages/VehicleChecklist', null, 'check-circle-o', null, false, 3)
];
