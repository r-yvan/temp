import { IModel } from './base.type';
import { IClass } from './class.type';
import { AssignedCourse, ICourse } from './course.type';
import { ITerm } from './other.type';
import { IUser } from './user.type';

export interface Teacher extends IUser {
  address: any;
  classes: any;
  currentClass: IClass;
  courses: AssignedCourse[];
}

export interface TeacherClassCourse extends IModel {
  teacher: Teacher;
  myClass: IClass;
  course: ICourse;
  term: ITerm;
}
