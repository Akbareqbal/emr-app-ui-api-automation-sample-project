package emr;
import com.intuit.karate.junit5.Karate;

class PatientsTest {
    @Karate.Test
    Karate testPatients() {
        return Karate.run("patients").relativeTo(getClass());
    }
}
