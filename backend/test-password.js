import bcrypt from "bcryptjs";

const testPassword = async () => {
  const storedHash =
    "$2a$12$F2XhuquizOOUeWUhnDv7X.KxxlUHHkcVh6hhGnCa/w8CTjok6ZkE.";
  const testPassword = "password123";

  try {
    const isValid = await bcrypt.compare(testPassword, storedHash);
    console.log("Password test result:", isValid);

    if (isValid) {
      console.log('✅ Password "password123" is correct!');
    } else {
      console.log('❌ Password "password123" is incorrect');

      // Let's also test what the hash of "password123" should be
      const newHash = await bcrypt.hash(testPassword, 12);
      console.log('Hash of "password123":', newHash);

      // Test with the new hash
      const isValidNew = await bcrypt.compare(testPassword, newHash);
      console.log("Test with new hash:", isValidNew);
    }
  } catch (error) {
    console.error("Error testing password:", error);
  }
};

testPassword();
