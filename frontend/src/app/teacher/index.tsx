import { Redirect } from "expo-router";

// The teacher section starts on the teacher home screen.
export default function TeacherIndex() {
  return <Redirect href="/teacher/home" />;
}
