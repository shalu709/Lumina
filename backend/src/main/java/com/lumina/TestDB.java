import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class TestDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=disable&prepareThreshold=0";
        String user = "postgres.mbrncvjpmlaambdhispa";
        String password = "shaluedarpit2032";

        System.out.println("Testing connection...");
        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("CONNECTED SUCCESSFULLY!");
        } catch (SQLException e) {
            System.out.println("CONNECTION FAILED:");
            e.printStackTrace();
        }
    }
}
