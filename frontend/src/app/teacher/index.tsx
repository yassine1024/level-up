import { Redirect } from "expo-router";

// The teacher section starts on the course resources screen.
export default function TeacherIndex() {
  return <Redirect href="/teacher/resources" />;
}
