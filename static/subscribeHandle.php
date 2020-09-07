<?php
$userAddress = $_POST['email'];
$result = false; // ok

function writeInFile($text)
{
  try {
    $fp = fopen('subscribers.txt', 'a'); //opens file in append mode  
    fwrite($fp, $text . "\n");
    fclose($fp);
  } catch (Exception $e) {
    $GLOBALS['result'] = $e->getMessage();
  }
}

if (!$userAddress) {
  $result = "No email provided";
} elseif (!filter_var($userAddress, FILTER_VALIDATE_EMAIL)) {
  $result = "Invalid email format";
} else {
  writeInFile($userAddress);
}

$fromAjax = $_POST['ajax'];
if ($fromAjax) {
  header("Content-type: application/json");
  echo json_encode(array("result" => $result));
  return;
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Travel buddy | Subscribe</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css">
</head>

<body>
  <div class="container pt-5">
    <?php if (!$result) : ?>

      <div class="alert alert-success" role="alert">
        <h4 class="alert-heading">Well done!</h4>
        <p>We will send you a letter on launch. Thanks for your interest.</p>
        <a href="https://travelbuddy.io">Get back</a>
      </div>

    <?php else : ?>

      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Something went wrong!</h4>
        <p>We can't handle your address (<b><?php echo $result; ?></b>).
          <br> Please write us on <a href="mailto:support@travelbuddy.io">support@travelbuddy.io</a> and describe what happened.</p>
        <a href="https://travelbuddy.io">Get back</a>
      </div>

    <?php endif; ?>

  </div>
</body>

</html>