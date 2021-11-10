import java.util.Random;

public class Foo{
    public static void main(String args[]){
        Random random1 = new Random(23);
        Random random2 = new Random(3847);
        int i = 0;
        while(true){
           if(i%1000==0){
                System.out.println(i);
                try{
                    Thread.sleep(100);  //暂停100ms
                }catch(Exception e){}
            }
            
            i++;
            // add(i,i+1);   
            // foo(i%20, 20);
            bar(i%100);
            // bar(new Mammal(i%100, "yellow"));
            commonSubExp(random1.nextInt(100), random2.nextInt(50));
            deadCode(random1.nextInt(100), random2.nextInt(50));
            copyPropagation(random1.nextInt(100), random2.nextInt(50));
            controlFlow(random1.nextInt(100), random2.nextInt(50));
            noElse(random1.nextInt(100), random2.nextInt(50));
        }
    }


    public static int add(int x, int y){
        return x + y;
    }

    public static int foo(int a, int b){
        int x;
        if (a>10){
            x = a + b;
        }
        else{
            x = a - b;
        }
        return x;
    }

    public static int bar(int a){
        int sum = 0;
        for(int i = 1; i <= a; i++){
            sum = sum + i;
        }
        return sum;
    }

    public static void bar1(int a){
        for(int i = 1; i <= a; i++){
        }
    }

    public static Mammal bar2(Mammal a){
        for(int i = 1; i <= a.weight; i++){
        }

        return a;
    }

    //删除公共子表达式
    public static int commonSubExp(int a, int b){
        int x = a + b;
        int y = a + b;
        int z = x + y + 10;
        return z;
    }

    //删除死代码
    public static int deadCode(int a, int b){
        int x = a + b;
        int y = a + b;
        int m = a - 2;
        int z = x + y + 10;
        return z;
    }

    //拷贝传播
    public static int copyPropagation(int a, int b){
        int x = a + b;
        int y = x;
        int z = y - x;
        return z;
    }

    public static int controlFlow(int a, int b){
        int x = a + 10;
        int y;
        if (x > b){
            y = a -10;
            if (y > 10){
                y = y+10;
            }
        }
        else{
            y = a -20;
        }

        int z = y - x;
        return z;
    }

    public static int noElse(int a, int b){
        int x = a + 10;
        int y = 0;
        if (x > b){
            y = a -10;
        }
        int z = y - x;
        return z;
    }


    static class Mammal{
        int weight;
        String color;
        public Mammal(int weight, String color){
            this.weight = weight;
            this.color = color;
        }
    }


}