namespace idcard.Models
{
    public class ServiceResponse<T>
    {
        public T Data { get; set; }
        public bool Status { get; set; } = true;
        public string Message { get; set; } = null;
        public int Status_code { get; set; } = 200;
    }
}